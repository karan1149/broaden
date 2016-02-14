Users = new Mongo.Collection('users');
Ratings = new Mongo.Collection('ratings');


Meteor.methods({
  addUser: function(params){
    var name = params[name];
    var password = params[password];
    var phoneNumber = params[phoneNumber];
    Users.insert({name: name, phoneNumber: phoneNumber, password: CryptoJS.SHA256(password).toString()});
  },
  addContacts: function(params){
    var phoneNumber = params[phoneNumber];
    var contactList = params[contactList];
    Users.update({phoneNumber: phoneNumber}, {$set: {contactList: contactList}});
  },
  getUser: function(params){
    var phoneNumber = params[phoneNumber];
    Users.findOne({phoneNumber: phoneNumber});
  },
  rate: function(phoneNumber, toNum, toName, val1, val2, val3, val4){
    var phoneNumber = params[phoneNumber];
    var toNum = params[toNum];
    var toName = params[toName];
    var val1 = params[val1];
    var val2 = params[val2];
    var val3 = params[val3];
    var val4 = params[val4];
    var fromName = Users.findOne({phoneNumber: phoneNumber});
    Ratings.insert({from: phoneNumber, fromName: fromName, toName: toName, toNum: toNum, val1: val1, val2: val2, val3: val3, val4: val4});
  },
  getTopRatedFriends: function(params){
    var phoneNumber = params[phoneNumber];
    var attr = params[attr];
    var contactList = Users.findOne({phoneNumber: phoneNumber}).contactList;
    var fromName = Users.findOne({phoneNumber: phoneNumber}).name;
    var list = [];
    contactList.forEach(function(value){
      var user = Users.findOne({phoneNumber: value});
      if (user){
        var ratings = Ratings.find({toNum: user.phoneNumber}).fetch();
        var sum = 0;
        var count = 0;
        ratings.forEach(function(value){
          sum += value[attr];
          count++;
        });
        var avg = sum / count;
        // list contains name of current user as fromName
        list.push({fromName: name, toName: user.name, toNum: user.phoneNumber, avg: avg});
      }
      list.sort(function(a, b){
        return a.avg - b.avg;
      });
      if (list.length > 20){
        list.pop;
      }
    });
    return list;
  },
  getTopRatedNetwork: function(params){
    var phoneNumber = params[phoneNumber];
    var attr = params[attr];
    var contactList = Users.findOne({phoneNumber: phoneNumber}).contactList;
    var list = [];
    contactList.forEach(function(value){
      var user = Users.findOne({phoneNumber: value});
      if (user){
        var friendContactList = user.contactList;
        friendContactList.foreach(function(value){
          var extendedUser = Users.findOne({phoneNumber: value.phoneNumber});
          if (extendedUser && extendedUser.phoneNumber !== phoneNumber){
            var ratings = Ratings.find({toNum: extendedUser.phoneNumber}).fetch();
            var sum = 0;
            var count = 0;
            ratings.forEach(function(value){
              sum += value[attr];
              count++;
            });
            var avg = sum / count;
            list.push({fromName: name, toName: user.name, toNum: user.phoneNumber, avg: avg});
            list.sort(function(a, b){
              return a.avg - b.avg;
            });
            if (list.length > 20){
              list.pop;
            }
          }
        });
      }
    });
    return list;
  }
});
if (Meteor.isServer){
  Meteor.publish('Users', function(){
    return Users.find();
  });
  Meteor.publish('Ratings', function(){
    return Users.find();
  });
}
