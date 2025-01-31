const mongoose = require("mongoose");
const Activity = mongoose.model("Activity");

const getActivities = (req, res) => {
  let query = {
    user: req.auth._id
  };

  let tag = req.query.tag;
  if (tag != null) {
    query.tags = tag;
  }

  let from = req.query.from;
  if (from != null) {
    if ("date" in query) {
      query.date.$gte = from;
    } else {
      query.date = {
        $gte: from
      };
    }
  }

  let to = req.query.to;
  if (to != null) {
    if ("date" in query) {
      query.date.$lt = to;
    } else {
      query.date = {
        $lt: to
      };
    }
  }

  Activity.find(query)
    .sort("-date -created")
    .populate("category")
    .populate("currency")
    .populate("subcategories.category")
    .exec((error, result) => {
      if (error) {
        return res.status(500).json({
          message: "The data could not be retrieved.",
        });
      } else {
        return res.status(200).json(result);
      }
    });
};

const getActivity = (req, res) => {
  const activityId = req.params.activityId;
  if (activityId) {
    Activity.findOne({
      $and: [{
        _id: activityId
      }, {
        user: req.auth._id
      }]
    })
      .populate("category")
      .populate("currency")
      .populate("subcategories.category")
      .exec((error, result) => {
        if (!result) {
          return res.status(404).json({
            message: "The activity with this identifier doesn't exist.",
          });
        } else if (error) {
          return res.status(500).json({
            message: "The data could not be retrieved.",
          });
        } else {
          return res.status(200).json(result);
        }
      });
  } else {
    return res.status(404).json({
      message: "Required parameter missing.",
    });
  }
};

const createActivity = (req, res) => {
  if (!req.body.amount || !req.body.category || !req.body.currency || !req.body.date || !req.body.title || !req.body.subcategories) {
    return res.status(400).json({
      message: "Required data missing.",
    });
  } else {
    if (req.body.category === "split" && subcategoriesInvalid(req.body.subcategories, req.body.amount)) {
      return res.status(400).json({
        message: "The sum of category amounts doesn't match the activity amount.",
      });
    } else {
      let subcategories = [];
      if (req.body.category === "split" && req.body.subcategories) {
        subcategories = sortSubcategories(req.body.subcategories);
      }

      Activity.create({
          amount: req.body.amount,
          category: req.body.category,
          currency: req.body.currency,
          date: req.body.date,
          description: req.body.description,
          isExcluded: req.body.isExcluded,
          tags: req.body.tags,
          title: req.body.title,
          user: req.auth._id,
          subcategories: subcategories,
          created: Date.now(),
          updated: Date.now(),
        },
        (error, result) => {
          if (error) {
            return res.status(400).json({
              message: "Required data missing.",
            });
          } else {
            return res.status(201).json(result);
          }
        }
      );
    }
  }
};

const updateActivity = (req, res) => {
  const activityId = req.params.activityId;
  if (activityId) {
    if (!req.body.amount || !req.body.category || !req.body.currency || !req.body.date || !req.body.title || !req.body.subcategories) {
      return res.status(400).json({
        message: "Required data missing.",
      });
    } else {
      if (req.body.category === "split" && subcategoriesInvalid(req.body.subcategories, req.body.amount)) {
        return res.status(400).json({
          message: "The sum of category amounts doesn't match the activity amount.",
        });
      } else {
        Activity.findById(activityId).exec((error, result) => {
          if (!result) {
            return res.status(404).json({
              message: "The activity with this identifier doesn't exist.",
            });
          } else if (error) {
            return res.status(500).json({
              message: "The action could not be completed.",
            });
          } else {
            let subcategories = [];
            if (req.body.category === "split" && req.body.subcategories) {
              subcategories = sortSubcategories(req.body.subcategories);
            }

            if (result.user === req.auth._id) {
              result.amount = req.body.amount;
              result.category = req.body.category;
              result.currency = req.body.currency;
              result.date = req.body.date;
              result.description = req.body.description;
              result.isExcluded = req.body.isExcluded;
              result.tags = req.body.tags;
              result.title = req.body.title;
              result.subcategories = subcategories;
              result.updated = Date.now();

              result.save((error, result) => {
                if (error) {
                  return res.status(500).json({
                    message: "The action could not be completed.",
                  });
                } else {
                  return res.status(200).json(result);
                }
              });
            } else {
              return res.status(403).json({
                message: "You do not have permission to access this resource.",
              });
            }
          }
        });
      }
    }
  } else {
    return res.status(404).json({
      message: "Required parameter missing.",
    });
  }
};

const deleteActivity = (req, res) => {
  const activityId = req.params.activityId;
  if (activityId) {
    Activity.findById(activityId).exec((error, result) => {
      if (!result) {
        return res.status(404).json({
          message: "The activity with this identifier doesn't exist.",
        });
      } else if (error) {
        return res.status(500).json({
          message: "The action could not be completed.",
        });
      } else {
        if (result.user === req.auth._id) {
          Activity.findByIdAndRemove(activityId)
            .exec(error => {
              if (error) {
                return res.status(500).json({
                  message: "The action could not be completed.",
                });
              } else {
                return res.status(204).json(null);
              }
            });
        } else {
          return res.status(403).json({
            message: "You do not have permission to access this resource.",
          });
        }
      }
    });
  } else {
    return res.status(404).json({
      message: "Required parameter missing.",
    });
  }
};

const subcategoriesInvalid = (subcategories, amount) => {
  const subcategoriesAmount = subcategories.reduce((sum, subcategory) => sum + subcategory.amount, 0);
  return Math.round(subcategoriesAmount * 100) !== Math.round(amount * 100);
}

const sortSubcategories = (subcategories) => {
  return subcategories.toSorted((a, b) => {
    if (Math.abs(a.amount) < Math.abs(b.amount)) {
      return 1;
    } else if (Math.abs(a.amount) > Math.abs(b.amount)) {
      return -1;
    } else {
      return 0;
    }
  });
}

module.exports = {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
};