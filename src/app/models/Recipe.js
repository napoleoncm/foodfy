const db = require('../../config/db');

module.exports = {
    all(callback) {

        const query = `SELECT recipes.*, chefs.name AS chef_name FROM recipes
        INNER JOIN chefs ON recipes.chef_id = chefs.id`

        db.query(query, null, function(err, results) {
            if(err) throw `Database error! ${err}`;

            callback(results.rows);
        });

    },
    findBy(filter, callback) {
        
        filter = filter || '';

        const query = `SELECT *, (SELECT name FROM chefs WHERE chefs.id = recipes.chef_id) as chef_name FROM recipes WHERE title ILIKE '%${filter}%'`;

        db.query(query, null, function(err, results) {
            if(err) throw `Database error! ${err}`;

            callback(results.rows);
        })

    },
    trending(callback) {
        
        db.query(`SELECT recipes.*, chefs.name AS chef_name FROM recipes
        INNER JOIN chefs ON recipes.chef_id = chefs.id LIMIT 6`, null, function(err, results) {
            if(err) throw `Database error! ${err}`;

            callback(results.rows);
        });

    },
    create(data, callback) {
        
        const query = `INSERT INTO recipes (chef_id, image, title, ingredients, preparation, information) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;

        const values = [
            data.chef_id,
            data.image,
            data.title,
            data.ingredients,
            data.preparation,
            data.information
        ];

        db.query(query, values, function(err, results) {
            if(err) throw `Database error ${err}`;

            callback(results.rows[0].id);
        })

    },
    find(id, callback) {

        const query = `SELECT recipes.*, chefs.name AS chef_name FROM recipes
        INNER JOIN chefs ON chefs.id = recipes.chef_id
        WHERE recipes.id = $1`

        db.query(query, [id], function(err, results) {
            if(err) throw `Database error! ${err}`;

            callback(results.rows[0]);
        });
    },
    update(data, callback) {

        const query = `UPDATE recipes SET chef_id = $1, image = $2, title = $3, ingredients = $4, preparation = $5, information = $6
        WHERE id = $7`;

        const values = [
            data.chef_id,
            data.image,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            data.id
        ];

        db.query(query, values, function(err, results) {
            if(err) `Database error! ${err}`;

            callback();
        });

    },
    delete(id, callback) {

        db.query('DELETE FROM recipes WHERE id = $1', [id], function(err, results) {
            if(err) `Database erro! ${err}`;

            callback();
        });

    },
    paginate(params) {
        
        const { filter, limit, offset, callback } = params;

        let query = "",
            filterQuery = "",
            totalQuery = "(SELECT COUNT(*) FROM recipes) AS total";

        if(filter) {
            filterQuery = `WHERE title ILIKE '%${filter}%'`;

            totalQuery = `(SELECT COUNT(*) FROM recipes ${filterQuery}) AS total`;
        }

        query = `SELECT recipes.*, ${totalQuery}, chefs.name AS chef_name FROM recipes
        INNER JOIN chefs ON chefs.id = recipes.chef_id
        ${filterQuery}
        LIMIT ${limit} OFFSET ${offset}`;

        db.query(query, null, function(err, results) {
            if(err) throw `Database error! ${err}`;

            callback(results.rows);
        });

    },
    chefsSelectOptions(callback) {
        db.query(`SELECT id,name FROM chefs`, function(err, results) {
            if(err) throw `Database error! ${err}`;

            callback(results.rows);
        });
    }
};