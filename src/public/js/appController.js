app.controller('appController', function ($document, $element, $log, $sce, $timeout, $scope, $http, $window, $mdDialog, oak, _, dataService, epson) {
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
    $scope.timer = null
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
      pizzaToAdd.id = Date.now()
      $scope.cart.push(pizzaToAdd)
      $scope.cart.subtotal = _($scope.cart).sumBy('total')
      $scope.cart.tax = $scope.cart.subtotal * .086
      $scope.cart.total = _($scope.cart).sumBy('total') + $scope.cart.tax
      // Appending dialog to document.body to cover sidenav in docs app
      var cartView = $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        contentElement: '#addToCartDialog',
        parent: window.angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
        fullscreen: false
      })
    }
    $scope.printReceipt = function(){
      console.log("Cart: ", $scope.cart)
      let subtotal = _($scope.cart).sumBy('total')
      let tax = subtotal * .086
      let total = _($scope.cart).sumBy('total') + tax
      $http({
        method: 'POST',
        url: 'http://localhost:9001/print-receipt',
        data: {
                'cart': $scope.cart,
                'env': $scope.env,
                'subtotal': subtotal,
                'tax': tax,
                'total': total
              }
      }).then(function successCallback (success) {
        console.log(success)
    
      }, function errorCallback (error) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      })
    }
    $scope.continueShopping = function() {
      $scope.selectedTypeIndex = 0
      $mdDialog.hide()
    }

    $scope.finishShopping = function() {
      $scope.cart = []
      $scope.pizzaOrder = {}
      angular.element(document.getElementsByClassName("modifier-item")).removeClass('selected')
      angular.element(document.getElementsByClassName("pizza-item")).removeClass('selected')
      $mdDialog.hide()
    }
    
    $scope.showPrompt = function(id, ev) {
      var showPrompt = $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        contentElement: `#${id}`,
        parent: window.angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
        fullscreen: false
      })
    }
    
    $scope.checkout = function(id,ev) {
      $mdDialog.hide()
      $scope.showPrompt(id,ev)
      
      $scope.ev = ev
      // $timeout(function(){
      //   $mdDialog.hide()
      //   $scope.showPrompt('showApproved',ev)
      // },4000)
      $scope.cart.taxRate = .086
      console.log($scope.cart)

      $http({
        method: 'POST',
        url: `http://localhost:9001/send-cart`,
        data: {
          'cart': $scope.cart,
          'env': $scope.env,
          'subtotal': $scope.cart.subtotal,
          'taxRate': .086,
          'tax': $scope.cart.tax,
          'total': $scope.cart.total
        }
      }).then(function(success) {
        console.log("REQUEST SENT : ", success)
      }, function(error) {
        console.log("ERROR: ", error)
        $mdDialog.hide()
        $scope.showPrompt('errorOccured',$scope.ev)
      })
    }

    oak.on('payment-response', function(resObj){
      $timeout(function(){    
        console.log("TERMINAL RESPONSE: ", resObj)
        if(resObj.data.status == "SUCCESS"){
          $mdDialog.hide()
          $scope.showPrompt('showApproved',$scope.ev)
        } else {
          $mdDialog.hide()
          $scope.showPrompt('showDenied',$scope.ev)
        }
      })
    })

    

    $scope.initApp = function () {
      oak.ready()
      oak.on('env-sent',function(obj){
        
        $timeout(function(){
          $scope.env = obj
          $scope.env.STORE_NAME = "strand"
          console.log("ENVIRONMENT: ", $scope.env)
          if(obj.hasOwnProperty("HAS_QRCODE") && obj.HAS_QRCODE === 'true'){
            $scope.showQrcode = true
          } else {
            $scope.showQrcode = false
          }
          // console.log("HAS_QRCODE: ",$scope.showQrcode)
        })
      })
    }

    $scope.idleTimeout = function(ev) {
 
      $window.onload = $scope.resetTimer;
      $window.ontouchstart = $scope.resetTimer; // catches touchscreen swipes as well 
      $window.onclick = $scope.resetTimer;      // catches touchpad clicks as well
      $window.onkeypress = $scope.resetTimer;   
      $window.addEventListener('scroll', $scope.resetTimer, true); // improved; see comments
    }

    $scope.timedOut = function(){
      oak.reload()
    }

    $scope.resetTimer = function() {
      clearTimeout($scope.timer);
      $scope.timer = setTimeout($scope.timedOut, 120000);  // time is in milliseconds
    }
    
    $scope.initApp()
       

  })