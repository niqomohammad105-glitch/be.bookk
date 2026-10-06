let books=JSON.parse(localStorage.books||"null")||[
  {
    title:"Senja di Antara Kita",author:"Rana Putri",type:"Fiksi",
    price:42000,progress:68,
    desc:"Fragmen tentang pulang dan percakapan yang tertunda."
  },
  {
    title:"Atlas Ruang Sunyi",author:"Damar Aksara",type:"Esai",
    price:35000,progress:24,
    desc:"Esai visual tentang menemukan jeda di kota yang berisik."
  },
  {
    title:"Orbit yang Hilang",author:"Nara Wisesa",type:"Sci-fi",
    price:50000,progress:0,
    desc:"Ekspedisi mencari rumah kedua di luar bumi."
  }
];

let saldo=Number(localStorage.saldo||248500);
let reviews=JSON.parse(localStorage.reviews||"{}");
let aktif=null;

const rp=n=>new Intl.NumberFormat("id-ID",{
  style:"currency",currency:"IDR",maximumFractionDigits:0
}).format(n);

const safe=v=>String(v).replace(/[&<>"']/g,x=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",
  '"':"&quot;","'":"&#039;"
}[x]));

function save(){
  localStorage.books=JSON.stringify(books);
  localStorage.saldo=saldo;
  localStorage.reviews=JSON.stringify(reviews);
}

function page(id){
  document.querySelectorAll(".page")
    .forEach(x=>x.classList.add("hide"));

  document.getElementById(id).classList.remove("hide");
  render();
}

function theme(){
  document.body.classList.toggle("dark");
  localStorage.dark=document.body.classList.contains("dark");
}

if(localStorage.dark==="true")document.body.classList.add("dark");

function render(){
  const search=(document.getElementById("search").value||"")
    .toLowerCase();

  document.getElementById("saldo").textContent=rp(saldo);
  document.getElementById("balance").textContent=rp(saldo);

  const list=books.filter(b=>
    `${b.title} ${b.author} ${b.type}`
    .toLowerCase().includes(search)
  );

  const html=list.map(b=>{
    const i=books.indexOf(b);

    return `
      <article class="book" onclick="readBook(${i})">
        <div class="cover">${safe(b.title[0])}</div>
        <small>${safe(b.type)}</small>
        <h3>${safe(b.title)}</h3>
        <p>${safe(b.author)}</p>
        <p>${b.progress?b.progress+"% dibaca":rp(b.price)}</p>
        <div class="progress">
          <i style="width:${b.progress}%"></i>
        </div>
      </article>
    `;
  }).join("");

  document.getElementById("books").innerHTML=html;
  document.getElementById("libraryBooks").innerHTML=html;
}

function readBook(i){
  aktif=books[i];

  readerTitle.textContent=aktif.title;
  readerType.textContent=aktif.type;
  readerDesc.textContent=aktif.desc;
  progress.value=aktif.progress;
  progressText.textContent=aktif.progress+"%";

  renderReviews();
  reader.classList.remove("hide");
}

function closeReader(){
  reader.classList.add("hide");
}

function saveProgress(value){
  if(!aktif)return;

  aktif.progress=Number(value);
  progressText.textContent=value+"%";
  save();
  render();
}

function upload(){
  books.unshift({
    title:title.value||"Karya baru",
    author:author.value||"Kreator",
    price:Number(price.value||0),
    desc:desc.value||"Karya digital baru.",
    type:"Karya kreator",
    progress:0
  });

  save();
  alert("Karya berhasil disimpan.");
  page("library");
}

function topUp(){
  const value=Number(topup.value);

  if(value<10000){
    alert("Minimal top up Rp10.000.");
    return;
  }

  saldo+=value;
  topup.value="";
  save();
  alert("Saldo berhasil ditambahkan.");
  render();
}

function makePDF(){
  const files=scan.files;

  if(!files.length){
    alert("Pilih gambar halaman terlebih dahulu.");
    return;
  }

  scanInfo.textContent=`${files.length} halaman siap diproses.`;

  const win=window.open("");

  if(!win){
    alert("Izinkan pop-up browser.");
    return;
  }

  win.document.write(`
    <title>BukuRuang PDF</title>
    <style>
      body{margin:0}
      img{display:block;width:100%;page-break-after:always}
    </style>
  `);

  [...files].forEach(file=>{
    const image=win.document.createElement("img");
    image.src=URL.createObjectURL(file);
    win.document.body.appendChild(image);
  });

  win.document.close();
  win.onload=()=>win.print();
}

function renderReviews(){
  const list=reviews[aktif.title]||[];

  if(!list.length){
    reviewsList.innerHTML='<p class="empty">Belum ada ulasan.</p>';
    return;
  }

  reviewsList.innerHTML=list.map(x=>`
    <div class="review">
      <strong>${"★".repeat(x.rating)}${"☆".repeat(5-x.rating)}</strong>
      <p>${safe(x.comment)}</p>
      <small>${safe(x.date)}</small>
    </div>
  `).join("");
}

function addReview(){
  if(!aktif)return;

  const comment=document.getElementById("comment").value.trim();
  const rating=Number(document.getElementById("rating").value);

  if(!comment){
    alert("Tulis komentar terlebih dahulu.");
    return;
  }

  if(!reviews[aktif.title])reviews[aktif.title]=[];

  reviews[aktif.title].unshift({
    rating,
    comment,
    date:new Date().toLocaleDateString("id-ID")
  });

  comment.value="";
  document.getElementById("comment").value="";
  save();
  renderReviews();
  alert("Ulasan berhasil dikirim.");
}

render();
