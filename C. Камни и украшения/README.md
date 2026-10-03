# C. Камни и украшения

Даны две строки строчных латинских символов: строка `J` и строка `S`. Символы, входящие в строку `J`, — «драгоценности», входящие в строку `S` — «камни». Нужно определить, какое количество символов из `S` одновременно являются «драгоценностями». Проще говоря, нужно проверить, какое количество символов из `S` входит в `J`.

# Формат ввода
На двух первых строках входного файла содержатся две строки строчных латинских символов: строка `J` и строка `S`. Длина каждой не превосходит 100 символов.

# Формат вывода
Выходной файл должен содержать единственное число — количество камней, являющихся драгоценностями.

## Пример

| Ввод | Вывод |
| --- | --- |
| `ab`<br>`aabbccd` | `4` |

## Примечание

Примеры решений:

- [Python](https://assets.contest.yandex.net/testsys/statement-file?hash=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..FGHuJ7WkVLmXB57E.CB8clY0lx0k6XQccGkVsT75ZJJFbNxp4KrXDUfFgNvnQjgidxDNv0iV_UXXqBhV0TElKomzReyMQ1eE3bSi3EHwQdywZK5HfgIY_s_1Dj8GojT6wdw.DVWhYs00gpiCwpGsDk1BJg)
- [C++](https://assets.contest.yandex.net/testsys/statement-file?hash=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..xkdoc9VDngua6fVu.bSUA388g34Ph9r8DtPPaGaN__FPID5YUmAR-oJtVB1kcuscMBIVGqohTDSC0N_UcaCD62iXbzebNBwRikECqcB_-q7cejHBJgl2MGGk8nj9DxQXcAVI.FMTxgr3ra7bIN8VwGVpkSA)
- [C#](https://assets.contest.yandex.net/testsys/statement-file?hash=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..FdNlBxv6IRjlXbNy.I1XRAn1GKwyT1EC_ronAuT3mBzGj7fCUJiPKDff1JsXNqk9Thnt8NzL2lY6CnIRSt9vxMA_q8rAQoV5-FydXfOtl0c4kkvNc6VKsx7c33iOAGN4DOg.GE4mL0rleUx36m2tgkC-BA)
- [Go](https://assets.contest.yandex.net/testsys/statement-file?hash=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..zH4udNV9CR0cCCZI.04U1f04rFNR2k2jXPhvZJjBfz6-PQsNGISWHUFQ3xZ1hFUEKsN7bvORMo5uVtJGI5A4QnH6rV3k3_NsS7-wR61cd0VmeQutEFBt7q9lVB1xjzrAwzw.mz6DeWNgcP7qrhORhGe5jg)
- [Java](https://assets.contest.yandex.net/testsys/statement-file?hash=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..a9EFPS4l2cmUaXCp.1AM2OJ7O3b0EAnL9XWiz13A8AngVDza1iEHSt7lZLyGiou9nJ9UM-tJcM-bh7C70SCnMkLAM3vDr9yYRlGW0FSjyhjjNTscBWD745sqWRr87bRSgmCqv.wyWRrap3ythchrlnDlMfAg)
- [Kotlin](https://assets.contest.yandex.net/testsys/statement-file?hash=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..y_cxk7vzwKgVCXpC.jUE1NnD8gFW-znQD876ZxjXcAysSX6ghla3EYVB3pKcJ0MVJSVRhCEd1fU0Jyb8iAJ4a1XOQ3Gia_9L8R9oYraR3AW1FcRv07pscnxZMxCmNES_Npg.J00AWia8k2f0mdFyvYmaBQ)
- [Swift](https://assets.contest.yandex.net/testsys/statement-file?hash=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..RqGvdE0DvN5Fc218.6L3Un1gQdhxyE-oqLHKOucp--N5-dCysRDpzBew20iv3zyu4EA5aUI5y80QgyQ32rxyfEvavwPf7m13GNZQGGYk8P0Z8zMLU8wIJc1hyHwStpjieDsNAtA.YpGfi5mZ2vlqInByr_QsRQ)
- [JavaScript](https://assets.contest.yandex.net/testsys/statement-file?hash=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Oj2LUbHtMqJznV1R.K-kifWK90vFY_YVdfmxgFUqpWJ51iU_-VKobvKOrqHmm9nvVcFkn78rM9TntqeUfE0kx4gNg8oJ_PqoUIYuOHjKy-Mn-RTeSer0OxmnkBRRDYxZgAw.W1OBv46LGTd2F30LD3ffwg)
