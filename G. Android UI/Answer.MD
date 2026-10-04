# Пояснительная записка к задаче G. Android UI

## Ответ

**Текст `World` с наложением поверх текста `Hello`.**

## Условие

Дан XML-макет:

```xml
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <RelativeLayout
        android:layout_width="wrap_content"
        android:layout_height="wrap_content">

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Hello, " />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="World" />

    </RelativeLayout>
</LinearLayout>
```

Нужно определить, какой интерфейс будет построен.

## Разбор

Внешний `LinearLayout` занимает весь доступный размер. Отсутствие у него `android:orientation` не приводит к ошибке компиляции XML, поэтому вариант «не скомпилируется» неверен.

Главное значение имеет внутренний `RelativeLayout`. В нём находятся два `TextView`: первый с текстом `Hello, ` и второй с текстом `World`.

Для обоих элементов указаны только размеры `wrap_content`. Никакие правила позиционирования `RelativeLayout` не заданы: нет `layout_below`, `layout_toEndOf`, `layout_alignParentStart` и т. п. Поэтому оба дочерних элемента получают одну и ту же исходную позицию — в верхней левой части родительского контейнера.

В результате два текста накладываются друг на друга. Второй `TextView` объявлен в XML после первого и отрисовывается поверх него, поэтому текст `World` перекрывает `Hello, `.

## Почему остальные варианты неверны

- **«Hello, World» по горизонтали** — для этого второй `TextView` нужно было бы расположить справа от первого явно, например через `android:layout_toEndOf`.
- **«Не скомпилируется»** — отсутствие `android:orientation` само по себе не является ошибкой XML.
- **«Hello, World» по вертикали** — `RelativeLayout` не располагает элементы автоматически друг под другом.
