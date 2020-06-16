const { dialog, getCurrentWindow } = require('electron').remote
const onezip = require('onezip');
const path = require('path');
const $ = require("./jquery-3.4.1.slim.min.js")

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
    let src = path.join(__dirname, 'plugins', 'RV2_v1.0.0-beta2.zip');
    const extract = onezip.extract(src, abs_path);

    $("#install").hide()
    $("#status").show()

    let status = $("#status span")
    let bar = $("#bar")

    status.text('Installing at: ' + abs_path)

    extract.on('start', (percent) => {
        console.log('extracting started');
        status.text('extracting started')
    });

    extract.on('progress', (percent) => {
        console.log(percent)
        status.text('Unzipping: ' + percent + '%')
        if (percent > 98) percent = 98
        bar.css({ "width": percent + '%' })
    });

    extract.on('error', (error) => {
        console.error(error);
    });

    extract.on('end', () => {
        status.text('done')
        console.log('done');

        const { shell } = require('electron').remote
        shell.openItem(abs_path + "/dev/install.bat")
    });



}

