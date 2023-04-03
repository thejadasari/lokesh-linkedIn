const fs = require('fs');
const path = require('path');
const { SignIn, ScrapProfile } = require('.');


// Check if directory exists
if(!fs.existsSync(path.join(__dirname, 'profile_inputs'))) {
    throw new Error('profile_inputs folder is missing to read profile data');
}

// Check for file with profiles to fetch

if(!fs.existsSync(path.join(__dirname, 'profile_inputs', 'pending', 'profiles.txt'))) {
    throw new Error('profile_inputs/pending/profiles.txt is missing to read profile data');
};

const profilesContent = fs.readFileSync(path.join(__dirname, 'profile_inputs','pending', 'profiles.txt'), 'utf-8');
const profiles = profilesContent.split('\r\n');
(async () => {
    try {
        console.log('Logging in to Linked In')
        await SignIn();
        console.log('Logged in to Linked In')
    } catch (error) {
        console.error('Failed to Login to LinkedIn', error);
    }
    
    for(const profile of profiles) {
        if(profile.trim()) {
            try {
                console.log('Fetching data from profile', profile);
                const profileData = await ScrapProfile(profile);
                console.log('Completed fetching data from profile', profile);
                console.log(profileData);
            } catch (error) {
                console.error('Failed fetching data from profile', profile);
            }
        }
    }
})();