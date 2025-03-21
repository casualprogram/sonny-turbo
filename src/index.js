
import checkOut from "./module/checkout.js";
import accountLogin from "./module/login.js";

async function main(){

    // login into the account and saved cookies browser
    await accountLogin();


    // loaded browser with cookies saved, logged in saved
    // await checkOut();

    console.log("The Angels captured !")
    return
}

main()