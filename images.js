const fs = require('fs');
const batchPromises = require('batch-promises');
const request = require('request');
const program = require('commander');

program
    .option('-r, --root [path]', 'root dir')
    .parse(process.argv);

const data = JSON.parse(fs.readFileSync(program.root+'/data.json', 'utf8'));

const imageDir = program.root+'/images';

if (!fs.existsSync(imageDir)){
    fs.mkdirSync(imageDir, {recursive: true});
}

batchPromises(50, data, post => new Promise((resolve, reject) => {
    console.log('downloading image: '+post.id);

    const req = request(post.display_url)
        .on('response', function(response) {
            if(response.statusCode != 200) {
                console.log('failed: '+post.id);
                resolve();
            }else {
                req.pipe(fs.createWriteStream(program.root+`/images/${post.id}.jpg`)).on('close', () => {
                    console.log('done: '+post.id);
                    resolve();
                });
            }
        });

})).then(results => {
    console.log('done');
});

