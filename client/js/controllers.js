'use strict';

/* Controllers */


var playerControllers = angular.module('playerControllers', ['ngMaterial']);


playerControllers.controller('mainController', ['$scope', '$timeout', '$mdSidenav', '$mdUtil', '$log', '$http', '$mdDialog', '$mdToast', '$mdComponentRegistry', function ($scope, $timeout, $mdSidenav, $mdUtil, $log, $http, $mdDialog, $mdToast, $mdComponentRegistry) {

    $scope.pusher = new PusherPlatform.App({
        appId: '578e0d6e-c617-481e-b184-5c149abc341d',
    });

    $scope.myFeed = $scope.pusher.feed('playground');

    $scope.myFeed.subscribe({ onItem: (item) => { loadFeed(item.body); } });

    $scope.feeds = [];

    $scope.toggleLeft = function () {
        $mdComponentRegistry.when('left').then(function (it) {
            it.toggle();
        });
    };

    $scope.addFeed = () => {
        loadFeed($scope.newFeedURL);
    };

    function loadFeed(feedURL) {
        $http.get("/feed/get?url=" + feedURL).then((response) => {
            if (response.status === 200) {
                let feedContent = response.data;
                feedContent.selected = true;
                $scope.feeds.push(response.data);
            }
        });
    };

    $scope.getSelectedArticles = () => {
        let selectedFeeds = [];
        for (let i = 0; i < $scope.feeds.length; i++) {
            if ($scope.feeds[i].selected) {
                selectedFeeds.push.apply(selectedFeeds, $scope.feeds[i].articles);
            }
        }
        return selectedFeeds;
    };

    $scope.htmlToPlaintext = () => {
        return function (text) {
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
        };
    };

    // Load example feeds
   // loadFeed("http://rss.golem.de/rss.php?feed=ATOM1.0");
   // loadFeed("http://www.heise.de/newsticker/heise-atom.xml");
}]);