interface templateOptions {
  title?: string;
  description?: string;
  content: string;
}
interface Express extends Express.Application {
  render_template(options: templateOptions): void;
}
