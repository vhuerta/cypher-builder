/**
 *
 * @constructor
 * @author Victor Huerta <vhuerta@blackcore.com.mx>
 */

 module.exports = new(function CypherBuilder() {

    this.whereArray = [];
    this.matchArray = [];
    this.returnArray = [];
    this.orderArray = [];
    this.limitString = "";

    this.match = function (match) {
        match = match ? " MATCH " + match + " = " : " MATCH ";
        this.matchArray.push(match);
        return this;
    };

    this.comma = function (match) {
        match = match ? " , " + match + " = " : " , ";
        this.matchArray.push(match);
        return this;
    };


    this.start = function (start) {
        start = start || "";
        this.matchArray.push(" START " + start + " ");
        return this;
    };

    this.var = function (name) {
        this.matchArray.push(" " + name + " = ");
        return this;
    };

    this.node = function (node) {
        node = node || "";
        this.matchArray.push(" (" + node + ") ");
        return this;
    };


    this.rel = function (rel) {
        rel = rel || "";
        this.matchArray.push(" -[" + rel + "]-> ");
        return this;
    };

    this.like = function (key, value, both) {
        return this._like(key, value, both, false);
    };

    this.likeOr = function (key, value, both) {
        return this._like(key, value, both, true);
    };

    this._like = function (key, value, both, or) {

        var where = "";

        if (both === "none") {
            where += key + " =~ '(?i)" + value + "'";
        } else if (both === "before") {
            where += key + " =~ '(?i)" + value + ".*'";
        } else if (both === "after") {
            where += key + " =~ '(?i).*" + value + "'";
        } else {
            where += key + " =~ '(?i).*" + value + ".*'";
        }

        return this._where(where, undefined, or);
    };

    this.where = function (key, value) {
        return this._where(key, value, false);
    };

    this.whereOr = function (key, value) {
        return this._where(key, value, true);
    };

    this._where = function (key, value, or) {
        var where;

        if (this.whereArray.length == 0) {
            where = " WHERE ";
        } else if (or) {
            where = " OR ";
        } else {
            where = " AND ";
        }
        if (value) {
            if (typeof value === "string")
                value = "'" + value + "'";
            where += key + " = " + value;

            this.whereArray.push(where);
        } else {
            where += key;
            this.whereArray.push(where);
        }

        return this;
    };

    this.count = function (key, alias) {
        var count = " COUNT(" + key + ") ";
        if (alias) {
            count += " AS " + alias + " ";
        }
        this.return(count);
        return this;
    };

    this.return = function (key) {
        var retrn;
        if (this.returnArray.length == 0) {
            retrn = " RETURN ";
        } else {
            retrn = " , "
        }
        retrn += key;
        this.returnArray.push(retrn);
        return this;
    };

    this.orderBy = function (property, order) {
        var orderBy;
        order = order || "ASC";
        if (this.orderArray.length == 0) {
            orderBy = " ORDER BY ";
        } else {
            orderBy = " , ";
        }
        orderBy += property + " " + order;
        this.orderArray.push(orderBy);
        return this;
    };

    this.limit = function (limit, skip) {
        if (skip) {
            this.limitString += " SKIP " + skip;
        }

        if (limit) {
            this.limitString += " LIMIT " + limit;
        }

        return this;
    };

    this.end = function (next) {
        var query = "";

        // MATCH
        _.forEach(this.matchArray, function (m) {
            query += m;
        });
        this.matchArray = [];

        // WHERE
        _.forEach(this.whereArray, function (w) {
            query += w;
        });
        this.whereArray = [];

        // RETURN
        _.forEach(this.returnArray, function (r) {
            query += r;
        });
        this.returnArray = [];

        // ORDER
        _.forEach(this.orderArray, function (o) {
            query += o;
        });
        this.orderArray = [];

        query += this.limitString;
        this.limitString = "";

        query = query.replace(/\s{2,}/g, ' ');
        query = query.trim();

        return query;
    };
})();
