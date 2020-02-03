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

    let output = [];

    var TwitterData = (mongoose.models && mongoose.models.twitter_data) ? mongoose.models.twitter_data : mongoose.model('twitter_data', {
        email: String,
        text: String,
        hashtags: String,
        expandedurl: String,
        name: String,
        screenname: String,
        location: String
    });
    let getDataResult = await TwitterData.find({email:event.email});
    if(getDataResult.err)
    {
        console.log("Getting data error");
    }
    else
    {
        let data = getDataResult;
        let tableData = {
            columns: [
                {
                    label: 'Name',
                    field: 'name',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'ScreenName',
                    field: 'screenname',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'Location',
                    field: 'location',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'Text',
                    field: 'text',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'Hashtags(s)',
                    field: 'hashtag',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'URL',
                    field: 'url',
                    sort: 'asc',
                    width: 200
                }
            ],
            rows : []
        };
        data.forEach(eachData => {
            let tempObj = {
                "name" : eachData.name,
                "screenname" : eachData.screenname,
                "location" : eachData.location,
                "text" : eachData.text,
                "hashtag" : eachData.hashtags,
                "url" : eachData.expandedurl
            }
            tableData.rows.push(tempObj);
        });

        output = tableData;
    }
    
    console.log("Final result : ", output);

    return output;
};