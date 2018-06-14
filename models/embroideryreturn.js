var db     = require('./db');

var create = function(body, callback){
  db.query(`INSERT INTO embroideryreturn (orderid, po, color, customer, embroiderydate, invoice, size1, size2, size3,size4, size5, size6, size7, size8, size9, size10
  ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [body.order, body.po, body.color, body.customer, body.embroiderydate, body.invoice, body.size1, body.size2, body.size3, body.size4, body.size5,
    body.size6, body.size7, body.size8, body.size9, body.size10], 
    function(err)
  {
    if(err){
      if (err.code === 'ER_DUP_ENTRY') {
        // If we somehow generated a duplicate user id, try again
        return create(body, callback);
      }
      return callback(err);
    }
    return callback(null, true);
  })
}

var add = function(body, callback){
  db.query('SELECT * FROM embroideryreturn WHERE po = ? AND invoice = ?  AND customer = ?', [body.po, body.invoice, body.customer], function(err, rows) {
    if (err)
      return callback(err);
    if (rows.length) {
      return callback(null, false);
    } else {
      // No user exists, create the user
      return create(body, callback);
    }
  });
}

var update = function(body, callback){
  db.query('UPDATE embroideryreturn SET ? WHERE id = ? AND orderid = ?', [
    {
      po: body.po, color: body.color, customer: body.customer, embroiderydate: body.embroiderydate, invoice: body.invoice, 
      size1: body.size1, size2: body.size2, size3: body.size3, size4: body.size4, size5: body.size5,
      size6: body.size6, size7: body.size7, size8: body.size8, size9: body.size9, size10: body.size10      
    },
    body.oldid, body.order
  ], function(err, result){
    if(err){
      return callback(err);
    }      
    return callback(null);
  })
}

var remove = function (body, callback){
  db.query('DELETE FROM embroideryreturn WHERE id = ?', [body.oldid], function(err, result){
    if(err){
      return callback(err);
    }else{
      return callback(null);
    }
  })
}

var list = function(body, callback){
  db.query('SELECT * FROM embroideryreturn WHERE orderid = ?', [body.orderid], function(err, rows) {    
    if (err)
      return callback(err);
    else
      return callback(null, rows);
  });
}

var all = function(callback){
  db.query('SELECT * FROM embroideryreturn', [], function(err, rows) {    
    if (err)
      return callback(err);
    else
      return callback(null, rows);
  });
}

var getByDate = function(date, callback) {
  db.query(
    `SELECT 
      embroideryreturn.*, orders.name as order_name, orders.buyername as buyername, orderdetail.style as style,
      customer.name as customer, other.name as color,
      (orderdetail.s1+orderdetail.s2+orderdetail.s3+orderdetail.s4+orderdetail.s5+orderdetail.s6+orderdetail.s7+orderdetail.s8+orderdetail.s9+orderdetail.s10) as orderdetail_pcs,
      sum(embroideryreturn.size1+embroideryreturn.size2+embroideryreturn.size3+embroideryreturn.size4+embroideryreturn.size5+embroideryreturn.size6+embroideryreturn.size7+embroideryreturn.size8+embroideryreturn.size9+embroideryreturn.size10) as pcs
    FROM embroideryreturn as embroideryreturn
    INNER JOIN orderdetail as orderdetail on embroideryreturn.po = orderdetail.id
    INNER JOIN orders as orders on embroideryreturn.orderid = orders.id
    INNER JOIN customer as customer on embroideryreturn.customer = customer.id
    INNER JOIN other as other on other.code = embroideryreturn.color
    WHERE embroideryreturn.embroiderydate <= ?
    GROUP BY embroideryreturn.id
    `, [date],
    function(err, result) {
      if(err) callback(err);
      else callback(null, result);
    }
  )
}

exports.add = add;
exports.update = update;
exports.list = list;
exports.update = update;
exports.remove = remove;
exports.all = all;
exports.getByDate = getByDate;