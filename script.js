dz = document.getElementById("dropzone");

var r = new Resumable({
  target: "upload.php",
  testChunks: false,
  chunkSize: 512 * 1024,
});

r.assignDrop(dz);
r.assignBrowse(document.getElementById("droptext"));

dropActive = true;
folderName = undefined;
folderURL = undefined;
filesUploading = 0;

errors = {};

r.on("fileAdded", function (file) {
  filesUploading++;
  Title.setStatus("uploading");
  if (dropActive) {
    dz.ondragover = undefined;
    dz.ondragenter = undefined;
    dz.ondragleave = undefined;
    dz.classList.remove("text-center");
    dz.classList.add("pt-4");
    dz.classList.add("pb-5");
    dz.innerHTML =
      "<div class='mb-3'><a id='droptextN' href='#'><small>Add more files</small></a></div>";
    r.assignBrowse(document.getElementById("droptextN"));
    dropActive = false;

    folderName = document.getElementById("folderName").value;

    if (folderName == "") {
      folderName =
        Math.random().toString(36).substring(2, 5) +
        Math.random().toString(36).substring(2, 5);
    }

    folderName = folderName.replace(/ /g, "_").replace(/[^\w]/gi, "");

    document.getElementById("folderInput").innerHTML =
      '<input type="text" class="form-control" id="folderName">';
    fn = document.getElementById("folderName");

    folderURL = "https://shorsh.de/upload/" + folderName + "/";

    fn.value = folderURL;
    fn.oninput = function () {
      fn.value = folderURL;
    };
    fn.onclick = function () {
      fn.select();
    };
  }

  file.relativePath = folderName;

  file.upload();

  watchUpload(file);
});

r.on("fileError", function (file, message) {
  errors[file.uniqueIdentifier] = message;
});

dz.ondragover = function (ev) {
  ev.preventDefault();
  dz.classList.add("bg-light");
};

dz.ondragenter = function (ev) {
  ev.preventDefault();
  dz.classList.add("bg-light");
};

dz.ondragleave = function (ev) {
  ev.preventDefault();
  dz.classList.remove("bg-light");
};

function watchUpload(file) {
  let dom = document.createElement("div");
  dom.classList.add("mb-3");
  let domTxt = document.createElement("div");
  let domTxtH6 = document.createElement("h6");
  domTxtH6.style.display = "inline";
  let prDiv = document.createElement("div");
  prDiv.classList = "progress mt-1";
  let pr = document.createElement("div");
  pr.classList = "progress-bar progress-bar-animated";
  pr.style.width = 0;
  domTxtH6.appendChild(document.createTextNode(file.fileName));
  domTxt.appendChild(domTxtH6);
  dom.appendChild(domTxt);
  prDiv.appendChild(pr);
  dom.appendChild(prDiv);
  dz.appendChild(dom);
  let domTxtSmallRight = document.createElement("small");
  domTxtSmallRight.style.float = "right";
  domTxtSmallRight.style.marginTop = "3px";
  domTxt.appendChild(domTxtSmallRight);
  // let prevProgress = 0
  // let prevTime = Date.now()

  function check() {
    if (file.isComplete()) {
      filesUploading--;
      domTxtSmallRight.innerText = "";
      if (errors[file.uniqueIdentifier] == undefined) {
        //dom.innerHTML = file.fileName + '<span class="badge badge-success ml-2">Success</span>'
        let domTxtSmall = document.createElement("small");
        let domTxtLink = document.createElement("a");
        domTxtLink.onclick = function () {
          copyTextToClipboard(encodeURI(folderURL + file.fileName));
        };
        domTxtLink.href = "#";
        domTxtLink.appendChild(document.createTextNode("Copy Link"));
        domTxtSmall.appendChild(domTxtLink);
        domTxt.appendChild(document.createTextNode(" - "));
        domTxt.appendChild(domTxtSmall);
        pr.style.width = "100%";
        pr.innerText = "Success";
        pr.classList.add("bg-success");
      } else {
        pr.style.width = "100%";
        pr.innerText = "Error";
        pr.classList.add("bg-danger");
        throw errors[file.uniqueIdentifier];
      }
    } else {
      const prN = file.progress();
      // const prPS = ((prN-prevProgress)*file.file.size)/((Date.now()-prevTime)/1000)
      domTxtSmallRight.innerText =
        humanFileSize(file.file.size * prN) +
        " / " +
        humanFileSize(file.file.size);
      pr.style.width = prN * 100 + "%";
      pr.innerText = Math.floor(prN * 100) + "%"; // +" - "+humanFileSize(prPS)+"/s"
      // prevProgress = prN
      // prevTime = Date.now()
      setTimeout(check, 100);
    }
  }

  setTimeout(check, 100);
}

function humanFileSize(bytes, si = true) {
  var thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }
  var units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  var u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + " " + units[u];
}

folderName =
  Math.random().toString(36).substring(2, 5) +
  Math.random().toString(36).substring(2, 5);
document.getElementById("folderName").value = folderName;

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log("Async: Copying to clipboard was successful!");
    },
    function (err) {
      console.error("Async: Could not copy text: ", err);
    }
  );
}

function titleHandler() {
  this.title = "Drop";

  this.status = "selecting files";
  this.setStatus = function (status) {
    this.status = status;
    this.update();
  }.bind(this);

  this.finished = 0;
  this.total = 0;

  let spinners = [".", "..", "..."];

  this.update = function () {
    let titleTmp = this.title + " | " + this.status;
    if (this.status == "uploading") {
      titleTmp = titleTmp + " " + spinners[0];
      spinners.push(spinners.shift());
      if (filesUploading == 0) {
        this.status = "done";
      }
      setTimeout(this.update, 300);
    }
    document.title = titleTmp;
  }.bind(this);

  setTimeout(this.update, 300);
}

let Title = new titleHandler();
