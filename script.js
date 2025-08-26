//selection des éléments

//const uploadFile = document.getElementById("uploadFile");
const uploadInput = document.getElementById("uploadFile");
const videoList = document.getElementById("videoList");

//modal
const modal = document.getElementById("modal");
const filmForm = document.getElementById("filmForm");
const cancelBtn = document.getElementById("cancelBtn");

//stocker temporairement le fichier selectioner
let currentFile = null;
let editingId = null

// quand on selectionne  une video
uploadInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file && file.type.startsWith("video/")) {
    currentFile = file;
    modal.style.display = "flex";
  }
});

// bouton cancel

cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
  currentFile = null;
  editingId = null;
});

// soumet le formulaire

filmForm.addEventListener("submit", function (e) {
  e.preventDefault();
 
  const title = document.getElementById("filmTitle").value;
  const author = document.getElementById("filmAuthor").value;
  const genre = document.getElementById("filmGenre").value;
  const year = document.getElementById("filmYear").value;

if (editingId){
  //mode edit
  updatVideo(editingId, title, author, genre, year);
  filmForm.reset();
  modal.style.display = "none";
  editingId = null; 
  return
}

if (!currentFile) return;

  const reader = new FileReader(); // lecteur des fichier pour transfomer la vidéo en dataURL
  reader.onload = function (ev) {
    const videoData = ev.target.result;
    
    // save la vidéo et ses infos
    const videoId = saveVideo (videoData, currentFile.type, title, author, genre, year);

    addFilmToDOM(videoId, videoData, currentFile.type, title, author, genre, year); //ajouter la vidéo dans la paage

    //réinitialise et ferme la modal
    filmForm.reset();
    modal.style.display = "none";
    currentFile = null;
  };
  reader.readAsDataURL(currentFile);
});

// ajouter une video dans le dom
function addFilmToDOM(id, src, type, title, author, genre, year) {
  const filmItem = document.createElement("div");
  filmItem.classList.add("film-item");
  filmItem.dataset.id = id;
  
  
  // la partie html plus infos
  filmItem.innerHTML = `
    <div class= "video-poste">
    <video controls>
    <source src="${src}" type="${type}">
    </video>
    <div class="poste">
     <div class="video-title"><h2>Title:${title}</h2></div>
   <div class="video-user"> Author: ${author}</div>
   <div class="video-meta">
   <div class="video-year"> Year: ${year}&ndash;</div>
   <div class="video-genre"> Genre: &nbsp;${genre}</div>
   </div>
   </div>
     <div class="video-actions">
     <button class="editBtn">Modifier</button>
     <button class="deleteBtn">Supprimer</button>
     </div>
   </div>

    `;
    
    
    //écouteur pour supprimer
    filmItem.querySelector(".deleteBtn").addEventListener("click", () =>{
      deleteVideo(id, filmItem)
    });
    
    //écouteur pour modifier
    filmItem.querySelector(".editBtn").addEventListener("click", () => {
      editVideo(id, title, author, genre, year)
    });

    // ajouter la vidéo dans a liste d'afficharge
    videoList.appendChild(filmItem);
  }

//===========fonction supprimer

function deleteVideo(id, element){
  //supprime dom
  element.remove();


//supprime aussi du localStorage
let videos = JSON.parse(localStorage.getItem("videos")) || [];
videos = videos.filter((video)=> video.id !== id);
localStorage.setItem("videos", JSON.stringify(videos));
}


function editVideo(id, title, author, genre, year){
//reouvrir le modal avec les anciennes l'infos
modal.style.display = "flex";

document.getElementById("filmTitle").value = title;
document.getElementById("filmAuthor").value = author;
document.getElementById("filmGenre").value = genre;
document.getElementById("filmYear").value = year;

editingId = id;
}

function updatVideo(id, newTitle, newAuthor, newGenre, newYear){
  //localstorage
  let videos = JSON.parse(localStorage.getItem("videos")) || [];
 videos = videos.map ((video) =>{
  if(video.id === id){
    return{ ...video, title: newTitle, author: newAuthor, genre: newGenre, year: newYear};

  }
  
  return video;
 });
 localStorage.setItem("videos", JSON.stringify(videos));

 //dom
 const element = document.querySelector(`.film-item[data-id="${id}"]`);
 if(!element) return;
 element.querySelector(".video-title").innerHTML = `<h2>Title: ${newTitle}</h2>`
  element.querySelector(".video-user").innerText = `Author: ${newAuthor}`
  element.querySelector(".video-year").innerText = `Year: ${newYear}`
  element.querySelector(".video-genre").innerText = `Genre: ${newGenre}`


}



// //soumet après la modification
// filmForm.onsubmit = function (e){
//   e.preventDefault();


// //nouvelles valeurs
// const newTitle = document.getElementById("filmTitle").value;
//   const newAuthor = document.getElementById("filmAuthor").value;
//   const newGenre = document.getElementById("filmGenre").value;
//   const newYear = document.getElementById("filmYear").value;

//   // mise à jour du dom
 
// //mise à jour du localstorage
 
//  //fermer le modal
//  filmForm.reset();
//  modal.style.display= "none";
//  currentFile = null
// };



function saveVideo(src, type, title, author, genre, year) {
  let videos = JSON.parse(localStorage.getItem("videos")) || [];
  // videos.push({ src, type, title, author, genre, year });
  // localStorage.setItem("videos", JSON.stringify(videos));


  //Ajoute un id unique
  const newVideo = {
    id: Date.now(),
    src, type, title, author, genre, year
  };
  videos.push(newVideo);
  localStorage.setItem("videos", JSON.stringify(videos)); 
  return newVideo.id;
}

//charger le vidéo deja save

  window.addEventListener("load", () => {
    let videos = JSON.parse(localStorage.getItem("videos")) || [];
    videos.forEach((video) => {
      addFilmToDOM(
        video.id,
        video.src,
        video.type,
        video.title,
        video.author,
        video.genre,
        video.year
          
     );
    });
  });
