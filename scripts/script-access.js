//TESTE PARA VALIDAÇÃO DE ACESSO DE USUARIOS
let aArrUsers = [];
let cUserId = "prbretas";
let cUserIdInput = document.getElementById("");

// Encode64 the String - cUserId
let encodedString = btoa(cUserId);
//console.log(encodedString);

// Decode the String
let decodedString = atob(encodedString);
//console.log(decodedString);
aArrUsers[0] = [cUserId, encodedString];
