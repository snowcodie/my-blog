const mysql = require('mysql2/promise');

async function migrateCategoryToId() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blog_db'
  });

  try {
    console.log('Connected to database');

    // Get all nav sections to create slug -> id mapping
    const [sections] = await connection.execute('SELECT id, slug FROM nav_sections');
    console.log('Found sections:', sections);

    const slugToIdMap = {};
    sections.forEach(section => {
      slugToIdMap[section.slug] = section.id.toString();
    });

    console.log('Slug to ID mapping:', slugToIdMap);

    // Update series table - convert slug to id
    console.log('\n--- Updating series table ---');
    const [seriesRows] = await connection.execute('SELECT id, name, category FROM series');
    
    for (const series of seriesRows) {
      const currentCategory = series.category;
      const newCategory = slugToIdMap[currentCategory] || currentCategory;
      
      if (currentCategory !== newCategory) {
        console.log(`Series "${series.name}": ${currentCategory} -> ${newCategory}`);
        await connection.execute(
          'UPDATE series SET category = ? WHERE id = ?',
          [newCategory, series.id]
        );
      } else if (!slugToIdMap[currentCategory] && isNaN(currentCategory)) {
        console.log(`WARNING: Series "${series.name}" has unknown category: ${currentCategory}`);
      } else {
        console.log(`Series "${series.name}": Already using ID ${currentCategory}`);
      }
    }

    // Update posts table - convert slug to id
    console.log('\n--- Updating posts table ---');
    const [postRows] = await connection.execute('SELECT id, title, category FROM posts');
    
    for (const post of postRows) {
      const currentCategory = post.category;
      const newCategory = slugToIdMap[currentCategory] || currentCategory;
      
      if (currentCategory !== newCategory) {
        console.log(`Post "${post.title}": ${currentCategory} -> ${newCategory}`);
        await connection.execute(
          'UPDATE posts SET category = ? WHERE id = ?',
          [newCategory, post.id]
        );
      } else if (!slugToIdMap[currentCategory] && isNaN(currentCategory)) {
        console.log(`WARNING: Post "${post.title}" has unknown category: ${currentCategory}`);
      } else {
        console.log(`Post "${post.title}": Already using ID ${currentCategory}`);
      }
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrateCategoryToId();
