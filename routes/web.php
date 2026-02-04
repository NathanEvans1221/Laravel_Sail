<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $name = 'Laravel Sail';
    $message = 'Testing Xdebug breakpoints';

    // xdebug_break(); // 強制觸發中斷點

    return view('welcome', compact('name', 'message'));
});

Route::get('/xdebug', function () {
    xdebug_info();
});
