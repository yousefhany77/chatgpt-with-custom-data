import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { Markdown } from './Markdown';

const page = async () => {
  const loader = new DirectoryLoader('src/blogs', {
    '.txt': (path) => new TextLoader(path),
  });
  const docs = await loader.load();
  return (
    <section className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto">
      <br />
      <h2>
        Blogs Count: <span className="text-blue-500">{docs.length}</span>
      </h2>
      {docs.map((doc, i) => {
        return (
          <>
            <br />
            <hr />

            <br />
            <article key={i}>
              <Markdown md={doc.pageContent} />
            </article>
          </>
        );
      })}
    </section>
  );
};

export default page;
