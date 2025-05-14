<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = ['user_id', 'amount', 'description', 'type', 'date', 'category_id', 'note'];


    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
