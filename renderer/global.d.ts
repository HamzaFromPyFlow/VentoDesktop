// Global style module declarations for Vento Desktop
// This mirrors the behavior in the web app so that TS/JS tooling
// understands imports like `import styles from "./Foo.module.scss"`.

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Optional: plain (non-module) sass/scss if you ever import them directly
declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.sass' {
  const content: string;
  export default content;
}

