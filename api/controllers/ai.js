const {OpenAI} = require("openai");
const {get, post} = require("axios");

const getAnalysisResult = (res, url) => {
    get(url, {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY,
      }
    })
      .then((response) => {
          if (response.data.status === "running" || response.data.status === "notStarted") {
            // Repeat request every 0.5 seconds
            setTimeout(() => {
              getAnalysisResult(res, url);
            }, 500);
          } else if (response.data.status === "succeeded") {
            const data = response.data;

            if (data.analyzeResult.documents.length > 0) {
              const document = response.data.analyzeResult.documents[0];

              const analyzedReceipt = {
                date: document.fields.TransactionDate.valueDate,
                time: document.fields.TransactionTime.valueTime,
                total: document.fields.Total.valueCurrency.amount,
                merchant: {
                  name: document.fields.MerchantName.valueString,
                  address: document.fields.MerchantAddress.content,
                },
                items: document.fields.Items.valueArray.map((item) => {
                  return {
                    description: item.valueObject.Description.valueString,
                    total: item.valueObject.TotalPrice.valueCurrency.amount,
                  };
                }),
              }

              const openai = new OpenAI({
                apiKey: process.env.OPENAI_KEY,
              });

              const completion = openai.chat.completions.create({
                model: "gpt-4o-mini",
                store: true,
                messages: [{
                  "role": "system",
                  "content": `An analyzed receipt with the list of purchased items is provided. Assign the most suitable category to each item, while keeping the input data intact. Also fill out the other details of the merchant and correct them, if necessary.`,
                }, {
                  "role": "user",
                  "content": JSON.stringify(analyzedReceipt),
                }],
                response_format: {
                  "type": "json_schema",
                  "json_schema": {
                    "name": "receipt",
                    "strict": true,
                    "schema": {
                      "type": "object",
                      "properties": {
                        "date": {
                          "type": "string",
                          "description": "The date of the receipt in YYYY-MM-DD format",
                        },
                        "time": {
                          "type": "string",
                          "description": "The time of the receipt in HH:MM:SS format",
                        },
                        "total": {
                          "type": "number",
                        },
                        "merchant": {
                          "type": "object",
                          "properties": {
                            "name": {
                              "type": "string",
                            },
                            "streetAddress": {
                              "type": "string",
                            },
                            "postalCode": {
                              "type": "string",
                            },
                            "city": {
                              "type": "string",
                            },
                            "country": {
                              "type": "string",
                            },
                          },
                          "required": [
                            "name",
                            "streetAddress",
                            "postalCode",
                            "city",
                            "country",
                          ],
                          "additionalProperties": false,
                        },
                        "items": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "description": {
                                "type": "string"
                              },
                              "total": {
                                "type": "number"
                              },
                              "category": {
                                "type": "string",
                                "enum": [
                                  "clothes",
                                  "education",
                                  "electronics",
                                  "entertainment",
                                  "cafes_restaurants",
                                  "groceries",
                                  "healthcare",
                                  "household",
                                  "insurance",
                                  "miscellaneous",
                                  "personal_care",
                                  "savings",
                                  "sport",
                                  "taxes_fines",
                                  "car_transport",
                                  "travel",
                                ],
                              },
                            },
                            "required": [
                              "description",
                              "total",
                              "category",
                            ],
                            "additionalProperties": false,
                          },
                        },
                      },
                      "required": [
                        "date",
                        "time",
                        "total",
                        "merchant",
                        "items",
                      ],
                      "additionalProperties": false,
                    },
                  },
                },
              });

              completion
                .then((result) => {
                  if (result.choices.length > 0 && !(result.choices[0].message.refusal)) {
                    const receipt = JSON.parse(result.choices[0].message.content);
                    receipt.items.forEach((item) => {
                      if (item.category === "cafes_restaurants") {
                        item.category = "food_drink";
                      }
                    });

                    return res.status(200).json(receipt);
                  } else {
                    return res.status(500).json({
                      message: "The action could not be completed.",
                    });
                  }
                });
            } else {
              return res.status(400).json({
                message: "The receipt could not be analyzed.",
              });
            }
          } else {
            return res.status(400).json({
              message: "The receipt could not be analyzed.",
            });
          }
        }
      )
      .catch((error) => {
        return res.status(500).json({
          message: "The receipt could not be analyzed.",
        });
      });
  }
;

const analyzeReceipt = (req, res) => {
  const base64 = req.body.base64;
  if (!base64) {
    return res.status(400).json({
      message: "Required parameter missing.",
    });
  } else {
    post("https://egemond.cognitiveservices.azure.com/documentintelligence/documentModels/prebuilt-receipt:analyze?api-version=2024-11-30", {
      base64Source: base64,
    }, {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY,
      }
    }).then((response) => {
      if (response.headers.has("operation-location")) {
        const url = response.headers.get("operation-location");
        getAnalysisResult(res, url);
      }
    }).catch((error) => {
      return res.status(500).json({
        message: "The action could not be completed.",
      });
    });
  }
};

module.exports = {
  analyzeReceipt,
}