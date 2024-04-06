const ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
// import { levels } from "./lvl.js";
function errorHandler(statusStr, errorStr) {
  alert(statusStr + " " + errorStr);
}

export function postLevelsServer(flag, playerName, callback, customBody) {
  $.ajax({
    url: ajaxHandlerScript,
    type: "POST",
    dataType: "json",
    data: {
      f: flag,
      n: playerName,
      v: JSON.stringify(customBody),
    },
    cache: false,
    success: function (response) {
      callback(response);
    },
    error: errorHandler,
  });
}

//---------READ------------------//
// read.addEventListener("click", (e) => {
//   e.preventDefault();
//   const nName = document.getElementById("x2").value;
//   postLevelsServer("READ", nName, (e) => {
//     if (e.error) {
//       alert(`Ошибка ${e.error}`);
//     } else {
//       const ready = JSON.parse(e.result);
//       console.log(ready);
//       alert("все ок");
//     }
//   });
// });

// //---------INSERT------------------//
// insert.addEventListener("click", (e) => {
//   e.preventDefault();
//   const nName = document.getElementById("x1").value;
//   postLevelsServer(
//     "INSERT",
//     nName,
//     (e) => {
//       if (e.error) {
//         alert(`Ошибка ${e.error}`);
//       } else {
//         alert(`Файлы добавлены под ключем ${nName}`);
//         console.log(e);
//       }
//     },
//     levels 
//   );
// });
