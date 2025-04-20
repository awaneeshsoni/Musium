// utils/generateUsername.ts

function generateUsername(name: string): string {
    // Remove spaces and convert to lowercase
    let username = name.toLowerCase().replace(/\s+/g, '');
  
    // Add a random number (you can adjust the range as needed)
    const randomNumber = Math.floor(Math.random() * 1000);
    username += randomNumber;
  
    return username;
  }
  
  export default generateUsername;