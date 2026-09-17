/**
 * controllers/projectController.js
 */
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { formatProject, stringifyJsonField } from '../utils/helpers.js';

// GET /api/projects
export async function getAllProjects(req, res, next) {
  try {
    const pool = getPool();
    const showAll = req.query.all === 'true';
    const query = showAll
      ? 'SELECT * FROM projects ORDER BY numericId ASC'
      : 'SELECT * FROM projects WHERE published = 1 ORDER BY numericId ASC';
    const [rows] = await pool.query(query);
    return res.status(200).json({ success: true, count: rows.length, data: rows.map(formatProject) });
  } catch (err) {
    next(err);
  }
}

// GET /api/projects/:id
export async function getProject(req, res, next) {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE id = ? OR LOWER(slug) = LOWER(?) OR numericId = ? LIMIT 1',
      [id, id, isNaN(id) ? -1 : Number(id)]
    );
    if (rows.length === 0) throw new AppError(`Project with identifier '${id}' not found.`, 404);
    return res.status(200).json({ success: true, data: formatProject(rows[0]) });
  } catch (err) {
    next(err);
  }
}

// POST /api/projects
export async function createProject(req, res, next) {
  try {
    const { title, shortDescription, fullDescription, image, category, tags, gallery, features, techStack, liveDemoUrl, githubUrl, published, featured } = req.body;
    if (!title) throw new AppError('Title is required', 400);

    const pool = getPool();
    const projectUuid = uuidv4();

    let slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [existing] = await pool.query('SELECT id FROM projects WHERE slug = ?', [slug]);
    if (existing.length > 0) slug = `${slug}-${Date.now()}`;

    await pool.query(
      `INSERT INTO projects (id, slug, title, shortDescription, fullDescription, image, category, tags, gallery, features, techStack, liveDemoUrl, githubUrl, published, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectUuid, slug, title,
        shortDescription || '',
        fullDescription || shortDescription || '',
        image || '/images/02_construction_project.png',
        category || 'Full Stack',
        stringifyJsonField(tags, ['React', 'Node.js']),
        stringifyJsonField(gallery, []),
        stringifyJsonField(features, []),
        stringifyJsonField(techStack, []),
        liveDemoUrl || '', githubUrl || '',
        published !== undefined ? (published ? 1 : 0) : 1,
        featured !== undefined ? (featured ? 1 : 0) : 1,
      ]
    );

    const [newRow] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectUuid]);
    return res.status(201).json({ success: true, message: 'Project created successfully with UUID!', data: formatProject(newRow[0]) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/projects/:id
export async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [existing] = await pool.query('SELECT * FROM projects WHERE id = ? OR slug = ? LIMIT 1', [id, id]);
    if (existing.length === 0) throw new AppError('Project not found', 404);

    const c = existing[0];
    const { title, shortDescription, fullDescription, image, category, tags, gallery, features, techStack, liveDemoUrl, githubUrl, published, featured } = req.body;

    await pool.query(
      `UPDATE projects SET title=?, shortDescription=?, fullDescription=?, image=?, category=?, tags=?, gallery=?, features=?, techStack=?, liveDemoUrl=?, githubUrl=?, published=?, featured=? WHERE id=?`,
      [
        title !== undefined ? title : c.title,
        shortDescription !== undefined ? shortDescription : c.shortDescription,
        fullDescription !== undefined ? fullDescription : c.fullDescription,
        image !== undefined ? image : c.image,
        category !== undefined ? category : c.category,
        stringifyJsonField(tags, c.tags),
        stringifyJsonField(gallery, c.gallery),
        stringifyJsonField(features, c.features),
        stringifyJsonField(techStack, c.techStack),
        liveDemoUrl !== undefined ? liveDemoUrl : c.liveDemoUrl,
        githubUrl !== undefined ? githubUrl : c.githubUrl,
        published !== undefined ? (published ? 1 : 0) : c.published,
        featured !== undefined ? (featured ? 1 : 0) : c.featured,
        c.id,
      ]
    );

    const [updatedRow] = await pool.query('SELECT * FROM projects WHERE id = ?', [c.id]);
    return res.status(200).json({ success: true, message: 'Project updated successfully!', data: formatProject(updatedRow[0]) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/projects/:id
export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM projects WHERE id = ? OR slug = ?', [id, id]);
    if (result.affectedRows === 0) throw new AppError('Project not found', 404);
    return res.status(200).json({ success: true, message: 'Project deleted successfully!' });
  } catch (err) {
    next(err);
  }
}
