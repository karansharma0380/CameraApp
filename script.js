let video = document.querySelector("video");
let audio = document.querySelector("audio");
let body = document.querySelector("body");
let btn = document.querySelector("button#record");
let capBtn = document.querySelector("button#capture");
let galleryBtn = document.querySelector("#gallery");
let constraints = {video: true,audio:true};
let mediaRecorder;
let isRecording = false;
let chunks = [];

let filter = "";
let filters = document.querySelectorAll(".filters");

let zoomIn = document.querySelector(".zoom-in");
let zoomOut = document.querySelector(".zoom-out");
let minZoom = 1;
let maxZoom = 3;
let currZoom = 1;

galleryBtn.addEventListener("click",function(){
    location.assign("gallery.html");
})

for(let i=0;i<filters.length;i++){
    filters[i].addEventListener("click",function(e){
        filter = e.currentTarget.style.backgroundColor;
        removeFilter();
        applyFilter(filter);
    });
}

zoomIn.addEventListener("click",function(){
    if(currZoom < maxZoom){
        currZoom += 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
});

zoomOut.addEventListener("click",function(){
    if(currZoom > minZoom){
        currZoom -= 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
});

navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream){
    video.srcObject = mediaStream;
    // navigator = browser ka object (Already defined)
    // mediaDevices = navigator ka object
    // getUserMedia = mediaDevices ka function, return promise with input stream
                    //promise resolve permission allowed to browser by us
                    //promise reject permission denied to browser by us
    //constraints = kya kya chahie hume browser se
    // srcObject = video ka src attribute
    // mediaStream = constraints wale cheezo ka output stream

    let options = { mimeType: "video/webm; codecs=vp9" };
    //Just options to read the downloaded file
    mediaRecorder = new MediaRecorder(mediaStream);
    //mediaRecorder = predefined object which can record mediaStream
    mediaRecorder.addEventListener("dataavailable", function(e){
        chunks.push(e.data);
    })
    //mediaRecorder.start() = start recording video, when some data is
                            //stored it calls the above dataavailable event
                            // and pieces are stored in chunk.
    mediaRecorder.addEventListener("stop",function(){
        let blob = new Blob(chunks,{type:"video/mp4"});
        chunks = [];
        let url = URL.createObjectURL(blob);
        // let a = document.createElement("a");
        // a.href = url;
        // a.download = "video.mp4";
        addMedia("video",blob);
        // a.click();
        // a.remove();
    });
    //blob = some big file made using small pieces/chunks
    //this event is called when record button is pressed
    // a tag is made to download the file

});

//Function to start and stop recording
btn.addEventListener("click",function(){
    let innerDiv = btn.querySelector("div");
    if(isRecording){
        mediaRecorder.stop(); //this stops the ongoing recording
        isRecording = false;
        innerDiv.classList.remove("record-animation");
    } else {
        mediaRecorder.start(); //this starts the recording
        filter = "";
        removeFilter();
        isRecording = true;
        innerDiv.classList.add("record-animation");
    }
})

//Event on capture button to click photo
capBtn.addEventListener("click",function(){
    let innerDiv = capBtn.querySelector("div");
    innerDiv.classList.add("capture-animation");
    setTimeout(function(){
        innerDiv.classList.remove("capture-animation");
    },500);
    capture();
})

//function which photos
function capture(){
    let c = document.createElement("canvas");
    //video.videoWidth = camrera resolution ka width
    //video.width = video tag ka width
    c.width = video.videoWidth;
    c.height = video.videoHeight;

    //Draw the image on canvas, canvas used for a reason(check aage)
    //ctx.drawImage allows to pass video or photo to be drawn
    //in case of video an instant of the video will be drawn
    let ctx = c.getContext("2d");

    ctx.translate(c.width / 2,c.height / 2);
    ctx.scale(currZoom, currZoom);
    ctx.translate(-c.width / 2,-c.height / 2);

    ctx.drawImage(video,0,0);
    if(filter != ""){
        ctx.fillStyle = filter;
        ctx.fillRect(0,0,c.width,c.height);
    }
    // let a = document.createElement("a");
    // a.download = "image.jpg";
    //reason for using canvas
    //jo bhi canvas me yeh vo data url me convert ho jaega
    //ab href we can download easily 
    // a.href = c.toDataURL();
    addMedia("img",c.toDataURL());
    // a.click();
    // a.remove();
}

function applyFilter(filterColor){
    let filterDiv = document.createElement("div");
    filterDiv.classList.add("filter-div");
    filterDiv.style.backgroundColor = filterColor;
    body.appendChild(filterDiv);
}

function removeFilter(){
    let filterDiv = document.querySelector(".filter-div");
    if(filterDiv){
        filterDiv.remove();
    }
}