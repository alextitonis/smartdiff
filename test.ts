// Test file with intentional issues

function divide(a: number, b: number): number {
  // Bug: No check for division by zero
  return a / b;
}

function getUserData(userId: string) {
  // Security issue: SQL injection vulnerability
  const query = `SELECT * FROM users WHERE id = '${userId}'`;
  return database.query(query);
}

function processArray(items: any[]) {
  // Performance issue: Using nested loops inefficiently
  const result = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (items[i].id === items[j].parentId) {
        result.push({ parent: items[i], child: items[j] });
      }
    }
  }
  return result;
}
