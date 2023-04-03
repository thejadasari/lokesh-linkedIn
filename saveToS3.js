const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: 'data-deliveries-sales-and-bdr'
});

const uploadFile = (filepath, fileName) => {
    new Promise((resolve, reject) => {
        fs.readFile(filepath, (err, data) => {
            if(err) {
                console.error(filepath, 'reading failed', 'Reason:', err);
                reject(filepath);
                return;
            }

            const params = {
                Bucket: '',
                key: fileName,
                Body: JSON.stringify(data, null, 4)
            };
            s3.upload(params, (s3Err, s3Response) => {
                if(s3Err) {
                    console.error(filepath, 'uploading failed', 'Reason:', s3Err);
                    reject(filepath);
                    return;
                }
                console.log('Profile uploded successfully', s3Response?.location);
                resolve();
            });
        });
    });
}

uploadFile();