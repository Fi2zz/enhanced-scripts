@TSDecorator()
export class TypeScriptApp {
  init() {
    console.log("hello typescript");
  }
}

function TSDecorator() {
  return (TSClass: any) => {};
}
