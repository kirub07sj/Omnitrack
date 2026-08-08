const data = [{"status":"Active"}];
const activeProducts = data.filter((p) => !p.status || p.status.toLowerCase() === 'active');
console.log(activeProducts);
