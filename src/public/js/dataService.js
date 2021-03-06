app.factory('dataService', function() {
  
      this.getPizzaData = function(){
        return {
          "items": [
            {
              "name": "small",
              "price": 10,
              "modifiers": []
            },
            {
              "name": "medium",
              "price": 15,
              "modifiers": []
            },
            {
              "name": "large",
              "price": 20,
              "modifiers": []
            }
          ],
          "modifiers": {
              "meats": [
                {
                  "name": "bacon",
                  "price": 2
                },
                {
                  "name": "pepperoni",
                  "price": 2
                },
                {
                  "name": "ham",
                  "price": 2
                },
                {
                  "name": "sausage",
                  "price": 2
                }
              ],
              "veggies": [
                {
                  "name": "onions",
                  "price": 2
                },
                {
                  "name": "peppers",
                  "price": 2
                },
                {
                  "name": "olives",
                  "price": 2
                },
                {
                  "name": "mushrooms",
                  "price": 2
                },
              ]
            }
        }
    }
    // factory function body that constructs shinyNewServiceInstance
    return this
  });