// TODO: call this library zeroquery?

class DbQuery {
	constructor(tableName, modelType) {
		this.query = "";
		this.tableName = tableName;
		this.modelType = modelType;
		this.hasField = false;
		this.isLimited = false;
		this.hasWhere = false;
		this.hasOrder = false;
		//console.log(this.modelType);
	}

	// NOTE: Breaking Changes
	select() {
		this.query = "SELECT ";

		/*if (arguments.length > 0) {
			for (var i = 0; i < arguments.length; i++) {
				if (arguments[i] == null) continue;
				if (i != arguments.length - 1) this.query += arguments[i] + ", ";
				else this.query += arguments[i] + " ";
			}
		} else {
			this.query += "*";
		}

		return this.from();*/
		return this;
	}

	selectAll() {
		this.query += "SELECT * ";
		return this.from();
	}

	all() {
		this.query += "* ";
		return this.from();
	}

	// NOTE: Must manually call from after this.
	field(column, name) {
		if (this.query === "") {
			this.select();
		}

		if (!this.hasField) {
			this.query += column;
		} else {
			this.query += ", " + column;
		}

		if (name) {
			this.query += " AS '" + name + "' ";
		}

		this.hasField = true;
		return this;
	}

	from() {
		this.query += " FROM " + this.tableName;
		return this;
	}

	// TOOD: In Laravel, this returns a collection
	all() {
		return this.select();
	}

	limit(i) {
		if (this.query === "") {
			this.selectAll();
		}

		this.query += " LIMIT " + i;
		this.isLimited = true;
		return this;
	}

	group(s) {
		if (this.query === "") {
			this.selectAll();
		}

		if (!this.hasGroup) {
			this.query += " GROUP BY " + s;
		} else {
			this.query += ", " + s;
		}
		return this;
	}

	offset(i) {
		if (this.query === "") {
			this.selectAll();
		}

		this.query += " OFFSET " + i;
		return this;
	}

	// TODO: Add expr() query builder to allow for expressions like: `WHERE (blah=2 OR blah=3) AND ...`

	where(column, conditionOperator, value) { // Make this add AND or OR when multiple ones
		if (this.query === "") {
			this.selectAll();
		}

		if (value === null || value === undefined) {
			value = conditionOperator;
			conditionOperator = "=";
		}

		if (!this.hasWhere) {
			this.query += " WHERE " + column + " " + conditionOperator + " ";
		} else {
			this.query += " AND " + column + " " + conditionOperator + " ";
		}
		if (typeof value == 'string') {
			this.query += "'" + value + "'";
		} else {
			this.query += value;
		}

		this.hasWhere = true;
		return this;
	}

	// @Depricated - where() now automatically adds AND if more than one where
	andWhere(column, conditionOperator, value) {
		return this.where(column, conditionOperator, value);
	}

	order(column, direction) {
		if (this.query === "") {
			this.selectAll();
		}

		if (!hasOrder) {
			this.query += " ORDER BY " + column;
		} else {
			this.query += ", " + column;
		}
		if (direction == 'desc' || 'DESC') {
			this.query += " DESC";
		} else {
			this.query += " ASC";
		}
		return this;
	}

	// @Depricated - renamed to order()
	orderBy(column, direction) {
		return this.order(column, direction);
	}

	// take(i) { } // TODO: Does this exist?

	// TODO: find(1) and first()
	// Also allow find([1, 2, 3])

	// TODO: count(), max(), and sum()

	// join() // Inner Join
	// outerJoin() // Outer Join
	// rightJoin() // Right Join

	// leftJoin(tableName, name, onWhere) // name = null for no name

	leftJoinWhere(tableName, column, column2) {
		// TODO
	}

	leftJoinUsing(tableName, column) {
		if (this.query === "") {
			this.selectAll();
		}

		this.query += " LEFT JOIN " + tableName + " USING (" + column + ")";
		return this;
	}

	leftJoinJson() {
		return this.leftJoinUsing('json', 'json_id');
	}

	log(prefix = null) {
		console.log((prefix || "") + this.query);
		return this;
	}

	// TODO: newOnEmpty - creates new model if a model wasn't found

	// TODO: Not sure if this will work with a limit of 1.
	mapRowsToModel(rows) {
		var newRows = []
		for (var i = 0; i < rows.length; i++) {
			let row = rows[i];
			// Allows you to use the model's methods (for example, save)
			let newRow = new (this.modelType);

			for (var property in row) {
				if (row.hasOwnProperty(property)) {
					// Used so you can limit that columns that go
					// into the model, and used to make the saving
					// function work.
					if (newRow.columnsDefaults.has(property)) {
						newRow[property] = row[property];

						//if (property == "directory") {
							// TODO: Add setting to automatically get auth address from the directory field
						//}
					}
				}
			}

			newRows.push(newRow);
		}

		return Promise.resolve(newRows);
	}

	// TOOD: In Laravel, this returns a collection
	get(zeroframe) {
		if (this.query === "") return Promise.reject("Empty query.");
		return zeroframe.cmdp('dbQuery', [this.query])
			.then(this.mapRowsToModel.bind(this));
	}

	// TODO: Delete on a query - on a set of models
	delete() {

	}
}

class Model {
	static get tableName() { return "" }
	static get zeroFrame() { return null; }

	constructor(columnsDefaults) {
		this.columnsDefaults = new Set(columnsDefaults);
	}

	static all() {
		//return this.zeroframe.cmdp('dbQuery', ["SELECT * FROM " + this.tableName]);
		return new DbQuery(this.tableName, this).all();
	}

	static select() {
		return new DbQuery(this.tableName, this).select(...arguments);
	}

	// Inserts new model into database, or updates existing model.
	save() {
		// TODO
	}

	delete() {

	}

	// Delete by key
	static destroy() {

	}
}
Model.tableName = "";

module.exports = { Model, DbQuery };