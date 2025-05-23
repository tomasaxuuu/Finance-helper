<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <title>321</title>
    <style>
        @font-face {
            font-family: 'DejaVu Sans';
            font-style: normal;
            font-weight: normal;
            src: url({{ storage_path('fonts/DejaVuSans.ttf')
        }
        }) format('truetype');
        }

        body,
        div,
        p,
        strong,
        em,
        span,
        li {
            font-family: 'DejaVu Sans', Arial, sans-serif !important;
        }
    </style>
</head>

<body>
    {!! htmlspecialchars_decode(html_entity_decode($content, ENT_QUOTES, 'UTF-8'), ENT_QUOTES) !!}
    <h2>Финансовые транзакции</h2>
    <table>
        <thead>
            <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Категория</th>
                <th>Сумма</th>
                <th>Заметка</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $tx)
            <tr>
                <td>{{ $tx->date }}</td>
                <td>{{ $tx->type }}</td>
                <td>{{ $tx->category->name ?? 'Без категории' }}</td>
                <td>{{ $tx->amount }} ₽</td>
                <td>{{ $tx->note }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>