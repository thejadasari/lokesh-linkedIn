const dayjs = require('dayjs');
const fs = require('fs');
const path = require('path');
const { SignIn, ScrapProfile } = require('.');
const { saveDataToS3 } = require('./saveToS3');


// Check if directory exists
if (!fs.existsSync(path.join(__dirname, 'profile_inputs'))) {
    throw new Error('profile_inputs folder is missing to read profile data');
}

// Check for file with profiles to fetch

if (!fs.existsSync(path.join(__dirname, 'profile_inputs', 'pending', 'profiles.txt'))) {
    throw new Error('profile_inputs/pending/profiles.txt is missing to read profile data');
};

const profilesContent = fs.readFileSync(path.join(__dirname, 'profile_inputs', 'pending', 'profiles.txt'), 'utf-8');
const profiles = profilesContent.split('\r\n');

const saveData = async (profile, data) => {
    try {
        console.log('uploading to S3')
        const fileName = profile.split('/').join('_').split(':').join('_') + '.json';
        await saveDataToS3(fileName, data);
        console.log('uploded to S3')
        try {
            var dir = path.join(__dirname, 'profile_inputs', 'uploaded');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            fs.writeFileSync(path.join(dir, fileName), JSON.stringify(data, undefined, 4), 'utf-8');
            console.log('created a local copy in "uploaded" folder');
        } catch (error) {
            console.error(error);
        }
    } catch (error) {
        console.error('Failed to save to s3', error);
        try {
            var dir = path.join(__dirname, 'profile_inputs', 'failed_to_upload');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            fs.writeFileSync(path.join(dir, fileName), JSON.stringify(data, undefined, 4), 'utf-8');
            console.log('created a local copy in "failed_to_upload" folder');
        } catch (_error) {
            console.error(_error);
        }
    }
}

function saveProfileToCompletion(profileName, isSuccess) {
    try {
        var dir = path.join(__dirname, 'profile_inputs', 'completed');
        if (!isSuccess) {
            dir = path.join(__dirname, 'profile_inputs', 'failed');
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const filename = path.join(dir, (dayjs().format('DD-MM-YYYY')) + '.txt')
        fs.access(filename, fs.constants.F_OK | fs.constants.W_OK, (err) => {
            if (err) {
                fs.writeFileSync(filename, profileName, 'utf-8'); //create a new file
            } else {
                try {
                    fs.writeFileSync(filename, '\r\n'+profileName, { flag: 'a+' }); //append mode: adds text to actually existing file 
                } catch (err) {
                    console.error(err); //shows error if script can't add data 
                }
            }
        });
    } catch (_error) {
        console.error(_error);
    }
}


(async () => {
    try {
        console.log('Logging in to Linked In')
        await SignIn();
        console.log('Logged in to Linked In')
    } catch (error) {
        console.error('Failed to Login to LinkedIn', error);
        return;
    }

    for (const profile of profiles) {
        if (profile.trim()) {
            try {
                console.log('Fetching data from profile', profile);
                const profileData = await ScrapProfile(profile);
                console.log('Completed fetching data from profile', profile);
                console.log(profileData);
                saveProfileToCompletion(profile, true);
                saveData(profile, profileData);
            } catch (error) {
                saveProfileToCompletion(profile, false);
                console.error('Failed fetching data from profile', profile);
            }
        }
    }
})();