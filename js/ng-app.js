'use strict'

var app = angular.module('addressbook', ['ngAnimate']);

app.factory('Book', function () {
    var people = [];

    return {
        getEntries: function () {
            return people;
        },
        update: function (entry) {
            var index;            
            index = people.indexOf(entry);
            if (index > -1) {
                people[index] = entry;
            } else {
                people[people.length] = entry;
            }
        },
        remove: function (entry) {
            people.pop(entry);
        },
        set: function (jsonArray) {
            people = [];
            people = jsonArray;
        },
        getDate: function (datestring) {
            var d = new Date(datestring);
            return d;
        },
        getUpdateEntries: function () {
            var a = [];
            for (var i = 0; i < people.length; i++) {
                if (people[i].update) {
                    a.push(people[i]);
                }
            }
            return a;
        },
        refreshWithNew: function (newArray) {
            for (var i = 0; i < people.length; i++) {
                if (people[i].id.toString().toLowerCase() === 'new') {
                    this.remove(people[i]);
                }
            }

            for (var i = 0; i < newArray.length; i++) {
                var found = false;
                for (var j = 0; j < people.length; j++) {
                    if (newArray[i].id == people[j].id) {
                        found = true;
                        console.log('id found: '+newArray[i].firstname);
                        people[j] = newArray[i];
                    }
                }
                if (!found) {
                    console.log('insert new id: '+newArray[i].id);
                    people.push(newArray[i]);
                }
            }
        },
        sumOfEntries: function () {
            return people.length;
        }
    }
});
app.factory('PersonForm', function () {
    var emptyPerson = {
        "id": 'new',
        "name": '',
        "firstname": '',
        "birthdate": '',
        "gender": '',
        "address": '',
        "zip": '',
        "city": ''
    };
    var entry = [angular.copy(emptyPerson)];
    return {
        reset: function () {
            entry = [];
            entry.push(angular.copy(emptyPerson));
            return entry;
        },
        clear: function () {
            return this.reset();
        },
        getPerson: function () {
            return entry;
        },
        edit: function (person) {
            entry = [];
            entry.push(person);
        },
    };
});
app.controller('BookCtrl', function ($scope, $http, Book, PersonForm) {
    $scope.book = Book;
    $scope.form = PersonForm;
    $http.post('ajax.php').then(function (bookResponse) {
        if (bookResponse.status === 200) {
            $scope.book.set(bookResponse.data);
        }
    });
    $scope.edit = function (entry) {
        entry.update = true;
        $scope.form.edit(entry);
    };
    $scope.copy = function (entry) {
        var e = angular.copy(entry);
        e.id = 'new';
        $scope.book.update(e);
        $scope.edit(e);
    };
    $scope.del = function (entry) {

        $scope.book.remove(entry);

        if (String(entry.id).toLowerCase() != 'new') {
            $http({
                method: 'GET',
                url: 'ajax.php',
                params: {
                    rem: entry
                }
            }).then(function (response) {
                if (response.status == 200) {
                    document.getElementById('transfer-feedback').innerHTML = 'Entfernen erfolgreich';
                }
                $scope.book.refreshWithNew(response.data);
            });
        }

    };
});
app.controller('PersonFormCtrl', function ($scope, $http, PersonForm, Book) {
    $scope.form = PersonForm;
    $scope.book = Book;
    $scope.save = function (entry) {

        // set update status for entry, for new entry
        if (!entry.update) {
            entry.update = true;
            $scope.book.update(entry);
        }
        
        // get all updated entries from book
        var items = angular.toJson($scope.book.getUpdateEntries());
        
        $http({
            method: 'GET',
            url: 'ajax.php',
            params: {
                "items": items
            }
        }).then(function (response) {
            $scope.book.refreshWithNew(response.data);
            if (response.status == 200) {
                // clear the form for new editing and visual feedback
                $scope.form.clear();
                document.getElementById('transfer-feedback').innerHTML = 'Speichern erfolgreich';
            }
        }).then(function (errorResponse) {
            if (errorResponse) {
                console.warn('ERROR');
                console.info(error);
            }
        });
    };
});