const Twitter = require('twitter');

exports.handler = async (event) => {
    
    console.log("event : ", event);
    
    const mongoose = require('mongoose');

    let mongoURL = 'mongodb://anand:anand5@ds035674.mlab.com:35674/twitter_users';
    
    let mongooseConeRes = await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
    if(mongooseConeRes.err)
    {
        console.log("error : ", mongooseConeRes.err);
    }
    else
    {
        console.log("Mongo DB connection successful");
    }
    
    var Users = (mongoose.models && mongoose.models.twitter_login_users) ? mongoose.models.twitter_login_users : mongoose.model('twitter_login_users', {
        email: String,
        consumer_key: String,
        consumer_secret: String,
        access_token_key: String,
        access_token_secret: String
    });
    
    let output = [];
    
    let findingRes = await Users.findOne({email:event.email}).exec();
    if(findingRes === null)
    {
        output.push({
            "status" : "fail",
            "message" : "No email id found"
        });
    }
    else
    {
        let data = findingRes;
        var twitter = new Twitter({
            consumer_key: data.consumer_key,
            consumer_secret: data.consumer_secret,
            access_token_key: data.access_token_key,
            access_token_secret: data.access_token_secret
        });

        let date = new Date();
        date.setDate(date.getDate()-7);
        let startDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
        let filterParams = {count : 200, since : startDate};
        
        let twitterResponseData = await twitter.get('statuses/home_timeline', filterParams);
        if(twitterResponseData.error)
        {
            console.log("Twitter data Response error : ", twitterResponseData.error);
        }
        else
        {
            let allDataToSave = [];
            twitterResponseData.forEach(eachData => {
                if((eachData.entities.urls).length > 0)
                {
                    
                    let hashtags = [];
                    for(let i=0; i<(eachData.entities.hashtags).length; i++)
                    {
                        hashtags.push(eachData.entities.hashtags[i].text);
                    }

                    let tempObj = {
                        email : data.email,
                        text : eachData.text,
                        hashtags : hashtags.join(","),
                        expandedurl : eachData.entities.urls[0].expanded_url,
                        name : eachData.user.name,
                        screenname : eachData.user.screen_name,
                        location : eachData.user.location
                    };

                    allDataToSave.push(tempObj);
                }
            });
            
            var TwitterData = (mongoose.models && mongoose.models.twitter_data) ? mongoose.models.twitter_data : mongoose.model('twitter_data', {
                email: String,
                text: String,
                hashtags: String,
                expandedurl: String,
                name: String,
                screenname: String,
                location: String
            });
            
            let putToDb = await TwitterData.collection.insert(allDataToSave);
            
            if(putToDb.err)
            {
                console.log("Error while putting to MongoDb, reason : ", putToDb.err);    
            }
            else
            {
                console.log("Successfully stored data to MongoDb : ", putToDb);
                output.push(putToDb["result"]);
            }
        }
    }
    
    console.log("Final result : ", output);
    return output;
};
