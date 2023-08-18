fetch('api-fetch.kobayashikenji1.repl.co/api/info')
  .then(response => response.json())
  .then(data => {
    // Trích xuất thông tin cần thiết từ đối tượng JSON
    const cmd = data.commands; // Thay key và subkey bằng tên phù hợp trong JSON
    const sv = data.guilds;
    const userr = data.users;
    // Sử dụng thông tin đã lấy để cập nhật nội dung HTML hoặc thực hiện các thao tác khác
    // Ví dụ: cập nhật nội dung của một phần tử HTML
    const server = document.getElementById("servers");
    const user = document.getElementById("users");
    const cmds = document.getElementById("commands");
    cmds.textContent = cmd;
    user.textContent = userr;
    server.textContent = sv;
  })
  .catch(error => {
    console.error('Error:', error);
  });