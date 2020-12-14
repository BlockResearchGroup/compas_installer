const { dialog, getCurrentWindow } = require('electron').remote
const onezip = require('onezip');
const path = require('path');
const $ = require("./jquery-3.4.1.slim.min.js");
const fs = require('fs');
const spawn = require("child_process").spawn;

$("#install").click(install)
$("#exit").click(()=>{
    var window = getCurrentWindow();
    window.close();
})

$("#status").hide()
$("#console").hide()

let status = $("#status span")
let bar = $("#bar")

function cmd(exe, args) {

    $("#console").show()

    let log = ""

    let bat = spawn(exe, args);

    bat.stdout.on("data", (data) => {
        log += data
        $("#console").text(log)
    });

    bat.stderr.on("data", (err) => {
        log += err
        $("#console").text(log)
    });

    bat.on("exit", (code) => {
        console.log(log)
        console.log("Exit code:",code)
        if (code === 0)
            status.text("Installation finished, window can be closed")
        else
            status.text("Installation failed")
    });
    
}

function install() {

    let rhino_version = $( "#rhino_version option:selected" ).val();

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
    $("#for").hide()
    $("#rhino_version").hide()
    $("#status").show()

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
        status.text("Installing to Rhino...")
        cmd(abs_path+"/env/python.exe", ["-m", "compas_rv2.install", "--rhino_version", rhino_version])
    });



}

