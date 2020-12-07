const { dialog, getCurrentWindow } = require('electron').remote
const onezip = require('onezip');
const path = require('path');
const $ = require("./jquery-3.4.1.slim.min.js");
const fs = require('fs');

$("#install").click(install)
$("#exit").click(()=>{
    var window = getCurrentWindow();
    window.close();
})

$("#status").hide()


function install() {

    let folder = dialog.showOpenDialogSync({ properties: ['openDirectory'] })

    if (folder) folder = folder[0]
    else return

    let abs_path = path.join(path.resolve(folder), "RV2")
    let src = path.join(__dirname, 'plugins', 'RV2.zip');

    if (abs_path.includes(" ")){
        alert("The installation path cannot contain spaces, please choose another location")
        return
    }

    if (fs.existsSync(abs_path)){
        if (confirm(`Overwrite existing folder at ${abs_path}?`))
            fs.rmdirSync(abs_path, { recursive: true })
        else return
    }
    

    const extract = onezip.extract(src, abs_path);

    $("#install").hide()
    $("#status").show()

    let status = $("#status span")
    let bar = $("#bar")

    status.text('Starting Installation...')

    extract.on('start', (percent) => {
        console.log('extracting started');
        status.text('extracting started')
    });

    extract.on('progress', (percent) => {
        console.log(percent)
        status.text(`Unzipping to ${abs_path}: ${percent} %`)
        if (percent > 98) percent = 98
        bar.css({ "width": percent + '%' })
    });

    extract.on('error', (error) => {
        console.error(error);
        alert(error);
    });

    extract.on('end', () => {
        status.text('done')
        console.log('done');

        const { shell } = require('electron').remote
        shell.openItem(abs_path + "/install.bat")
    });



}

