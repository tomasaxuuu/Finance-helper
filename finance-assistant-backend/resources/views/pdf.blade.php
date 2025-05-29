<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #000000;
            text-align: center !important;
        }

        h2 {
            text-align: center;
            font-size: 16px;
            margin-bottom: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: left;
        }

        th {
            background-color: #dddddd;
            /* Работает стабильно */
            color: #000000;
            font-weight: bold;
            text-transform: uppercase;
        }

        tr:nth-child(even) {
            background-color: #f0f0f0;
        }

        td:nth-child(2) {
            text-align: right;
        }

        .amount-income {
            color: #008000;
            /* зелёный */
        }

        .amount-expense {
            color: #cc0000;
            /* красный */
        }
    </style>
</head>

<body>

    <h2>Finance Operations</h2>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Category</th>
                <th>Note</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($transactions as $transaction)
            <tr>
                <td>{{ $transaction->date ?? '-' }}</td>
                <td class="{{ $transaction->type === 'income' ? 'amount-income' : 'amount-expense' }}">
                    {{ $transaction->type === 'income' ? '+' : '−' }}
                    {{ number_format($transaction->amount ?? 0, 2, ',', ' ') }}
                </td>
                <td>{{ $transaction->type === 'income' ? 'Income' : 'Expense' }}</td>
                <td>{{ $transaction->category->name ?? '-' }}</td>
                <td>{{ $transaction->note ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

</body>

</html>