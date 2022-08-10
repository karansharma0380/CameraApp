//database create/open
//database createstore = gallery
//photo capture / video record

// format:
// data={
//     mid: 123423123,
//     type: "img"/"vid",
//     media: actual content (img => CanvasGradient.toDataUrl() , video => blob)
// }

let dbAccess;
let container = document.querySelector(".container");
let request = indexedDB.open("Camera",1);
let backBtn = document.querySelector("#back");

backBtn.addEventListener("click",function(e){
    location.assign("index.html");
})

request.addEventListener("success",function(){
    //when db opening is successful give acces to a global variable
    dbAccess = request.result;
});

request.addEventListener("upgradeneeded",function(){
    let db = request.result;
    //new object store, will automatically be called for 1st time while opening db
    db.createObjectStore("gallery",{keyPath:"mId"});
});

request.addEventListener("error",function(){
    alert("Some error occured");
});

function addMedia(type, media){
    //assuming it runs after dbAccess
    //opens a transaction => some work in DB
    let tx = dbAccess.transaction("gallery","readwrite");
    //Taking specific data store
    let galleryObjectStore = tx.objectStore("gallery");
    //Nature of object in a object store
    let data = {
        mId : Date.now(),
        type,
        media,
    };
    //add object to store
    galleryObjectStore.add(data);
}

function viewMedia() {
    let tx = dbAccess.transaction("gallery","readonly");
    let galleryObjectStore = tx.objectStore("gallery");
    //req will get the cursor and will call its success event
    let req = galleryObjectStore.openCursor();
    req.addEventListener("success",function(){
        let cursor = req.result;
        //for all items
        if(cursor){
            //Making Card for each item
            let div = document.createElement("div");
            div.classList.add("media-card");

            div.innerHTML = `<div class="media-container">
                            </div>
                            <div class="action-container">
                                <button class="media-download">Download</button>
                                <button class="media-delete" data-id="${cursor.value.mId}">Delete</button>
                            </div>`;

            let downloadBtn = div.querySelector(".media-download");
            let deleteBtn = div.querySelector(".media-delete");
            
            deleteBtn.addEventListener("click",function(e){
                let mId = e.currentTarget.getAttribute("data-id");
                e.currentTarget.parentElement.parentElement.remove();
                deleteMediaFromDB(mId);
            });

            if(cursor.value.type == "img"){
                let img = document.createElement("img");
                img.classList.add("media-gallery");
                img.src = cursor.value.media;
                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(img);

                downloadBtn.addEventListener("click",function(e){
                    let a = document.createElement("a");
                    a.download = "image.jpg";
                    a.href = e.currentTarget.parentElement.parentElement.querySelector(".media-container").children[0].src;
                    a.click();
                    a.remove();
                });
            }else{
                let video = document.createElement("video");
                video.classList.add("media-gallery");
                video.src = window.URL.createObjectURL(cursor.value.media);
                
                video.addEventListener("mouseenter",function(){
                    video.currentTime = 0;
                    video.play();
                });

                video.addEventListener("mouseleave",function(){
                    video.pause();
                });
                video.controls = true;
                video.loop = true;
                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(video);

                downloadBtn.addEventListener("click",function(e){
                    let a = document.createElement("a");
                    a.download = "video.mp4";
                    a.href = e.currentTarget.parentElement.parentElement.querySelector(".media-container").children[0].src;
                    a.click();
                    a.remove();
                });
            }
            container.appendChild(div);
            cursor.continue();
        }
    });
}

function deleteMediaFromDB(mId){
    let tx = dbAccess.transaction("gallery","readwrite");
    let galleryObjectStore = tx.objectStore("gallery");
    galleryObjectStore.delete(Number(mId));
}