let app = JSON.parse(
localStorage.getItem(
"hmaraBazaar"
)
)

||

{

shops:[],

products:[],

orders:[],

user:null,

market:"Surankote"

};

function saveApp(){

localStorage.setItem(

"hmaraBazaar",

JSON.stringify(
app
)

);

}
