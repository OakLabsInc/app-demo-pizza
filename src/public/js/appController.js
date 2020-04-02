app.controller('appController', function ($document, $element, $log, $sce, $timeout, $scope, $http, $window, $mdDialog, oak, _, dataService) {
    // ripples
    $scope.untapped = true
    $scope.cursor = {
      x: 0, y: 0
    }
    $scope.showCursor = false
    $scope.shouldReload = false
    $scope.cursorTimeout = 10000
    var cursorPromises = []
    var timer
  
    // main window touches. this will log all tapped items, and also add the UI ripple of the tapped area
    $scope.ripples = []
    $scope.mouseMoved = function ({ pageX: x, pageY: y }) {
      // dont show cursor if the settings has `false` or 0 as the cursorTimeout
      if ($scope.cursorTimeout) {
        resetCursorTimer()
        $scope.cursor = { x, y }
      }
    }
    var clearCursorPromises = function () {
      cursorPromises.forEach(function (timeout) {
        $timeout.cancel(timeout)
      })
      cursorPromises = []
    }
    var resetCursorTimer = function () {
      clearCursorPromises()
      $scope.showCursor = true
      timer = $timeout(function () {
        $scope.showCursor = false
      }, $scope.cursorTimeout)
      cursorPromises.push(timer)
    }
  
    $scope.$on('$destroy', function () {
      clearCursorPromises()
    })
  
    $scope.tapped = function ({ pageX, pageY }) {
      let id = Date.now().toString()
      $scope.showCursor = false
      $scope.ripples.push({
        x: pageX, y: pageY, id
      })
      $timeout(function () {
        _.remove($scope.ripples, { id })
      }, 500)
  
      if ($scope.untapped) {
        $scope.untapped = false
      }
    }
      
    $scope.pizza = dataService.getPizzaData()
    $scope.pizzaOrder = {}
    $scope.cart = []

    $scope.makeAnotherPizza = function(reset){
      $scope.pizzaOrder = {}
      angular.element(document.getElementsByClassName("modifier-item")).removeClass('selected')
      angular.element(document.getElementsByClassName("pizza-item")).removeClass('selected')
      $mdDialog.cancel()
    }

    $scope.changePizzaOrder = function(pizza, e) {

          $scope.pizzaOrder = pizza
          console.log("Pizza Order", angular.toJson($scope.pizzaOrder))
          angular.element(document.getElementsByClassName("modifier-item")).removeClass('selected')
          angular.element(document.getElementsByClassName("pizza-item")).removeClass('selected')
          angular.element(e.srcElement).addClass('selected')
          $scope.setPizzaTotal()
        

    }

    $scope.toggleModifier = function(mod,e) {
        if($scope.pizzaOrder.modifiers.indexOf(mod) < 0){
            $scope.pizzaOrder.modifiers.push(mod)
            angular.element(e.srcElement).addClass('selected')
        } else {
            $scope.pizzaOrder.modifiers.splice($scope.pizzaOrder.modifiers.indexOf(mod),1)
            angular.element(e.srcElement).removeClass('selected')
        }
        $scope.setPizzaTotal()
        console.log(angular.element(e.srcElement)[0].classList)
        console.log("pizzaOrder", angular.toJson($scope.pizzaOrder))
    }

    $scope.hasModifier = function(mod) {
        if($scope.pizzaOrder.hasOwnProperty('modifiers') && $scope.pizzaOrder.modifiers.indexOf(mod) >= 0 ){
            return true
        }
        return false
    }

    $scope.setPizzaTotal = function() {
      let sizeTotal = $scope.pizzaOrder.price
      let modifiersTotal = _($scope.pizzaOrder.modifiers).sumBy("price")
      $scope.pizzaTotal = sizeTotal + modifiersTotal
    }
    
    $scope.showCart = function(pizzaToAdd, ev) {
      pizzaToAdd.total = $scope.pizzaTotal
      $scope.cart.push(pizzaToAdd)
      // Appending dialog to document.body to cover sidenav in docs app
      var cartView = $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        contentElement: '#addToCartDialog',
        parent: window.angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
        fullscreen: false
      }).then(function() {
        $scope.status = 'You decided to get rid of your debt.';
      }, function() {
        $scope.status = 'You decided to keep your debt.';
      });
    }
    $scope.initApp = function (data) {
        $http({
            method: 'GET',
            url: '/getProductData/pizza'
          }).then(function successCallback (response) {
            $scope.pizzas = response.data
        
          }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          })
    }

    oak.ready()

  })