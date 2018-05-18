const sql = require('../util/sql-trim.js');
const columns = require('../util/columns');
const formatTime = require('../util/format-time');

class Article {
  /**
   * @param {mysql2.PromisePool} pool - instance of mysql2 connection pool
   */
  constructor(pool) {
    this.pool = pool
  }

  async retrieve(articleId) {
    // It seems MySQL function TRIM() does not work for Node.
    // It works in command line, in Golang.
    // There might be problems with the Nodejs driver.
    const query = sql`
    SELECT story.id AS id,
      story.ftid AS ftId,
      story.publish_status AS publishStatus,
      story.cheadline AS titleCn,
      story.clongleadbody AS standfirst,
      story.cbyline_description AS descCn,
      story.cauthor AS authorCn,
      story.cbyline_status AS statusCn,
      TRIM('\r\n' FROM story.cbody) AS bodyCn,
      NULLIF(story.eheadline, '') AS titleEn,
      NULLIF(story.ebyline_description, '') AS descEn,
      NULLIF(story.eauthor, '') AS authorEn,
      NULLIF(story.ebyline_status, '') AS statusEn,
      NULLIF(TRIM('\r\n' FROM story.ebody), '') AS bodyEn,
      story.tag AS tags,
      story.genre,
      story.topic AS topics,
      NULLIF(story.industry, '') AS industries,
      story.area AS region,
      story.fileupdatetime AS createdAt,
      story.pubdate AS publishedAt,
      story.last_publish_time AS updatedAt
    FROM cmstmp01.story AS story
    WHERE story.id = :articleId`;

    const [rows, ] = await this.pool.execute(query, {articleId});

    const article = rows[0]
    if (!article) {
      return null;
    }

    article.bodyCn = article.bodyCn.split('\r\n');

    if (article.bodyEn) {
      article.bodyEn = article.bodyEn.split('\r\n');
    }

    article.tags = article.tags.trim().split(',');
    article.topics = article.topics.trim().split(',');

    if (article.industries) {
      article.industries = article.industries.trim().split(',');
    }
   
    article.createdAt = formatTime.fromUnix(article.createdAt);
    article.publishedAt = formatTime.fromUnix(article.publishedAt);
    article.updatedAt = formatTime.fromUnix(article.updatedAt);

    return article;
  }
}

module.exports = Article