# Пояснительная записка к задаче H. Android networkText

## Ответ

```kotlin
Handler(Looper.getMainLooper()).post {
    textView.text = networkText
}
```

## Условие

Сетевой запрос выполняется в отдельном потоке:

```kotlin
override fun onResume() {
    super.onResume()
    val textView = findViewById<TextView>(R.id.text_view)

    Thread {
        val networkText = repository.getNetworkText()
        // надо обновить данные в textView
    }.start()
}
```

Нужно выбрать правильный способ установить полученный текст в `TextView`.

## Основная проблема

Код внутри `Thread { ... }` выполняется в фоновом потоке. В Android изменение объектов интерфейса должно выполняться в главном UI-потоке.

Поэтому прямое присваивание:

```kotlin
textView.text = networkText
```

внутри созданного `Thread` является неправильным подходом.

## Корректный вариант

```kotlin
Handler(Looper.getMainLooper()).post {
    textView.text = networkText
}
```

`Looper.getMainLooper()` возвращает очередь сообщений главного потока. `Handler` привязывается к этой очереди, а `post` помещает переданный блок кода на выполнение в UI-потоке.

Полный фрагмент выглядит так:

```kotlin
Thread {
    val networkText = repository.getNetworkText()

    Handler(Looper.getMainLooper()).post {
        textView.text = networkText
    }
}.start()
```

Таким образом, сетевой запрос выполняется в фоне, а изменение интерфейса — в главном потоке.

## Почему `join()` не подходит

Если вызвать `join()` из главного потока и ждать завершения сетевого запроса, UI будет заблокирован на всё время ожидания. Интерфейс перестанет реагировать на действия пользователя, а при долгой операции возможно состояние ANR (`Application Not Responding`).

## Что насчёт `textView.post`

Вариант:

```kotlin
textView.post {
    textView.text = networkText
}
```

также может использоваться для переноса действия в UI-поток. Однако по условию требовалось выбрать один ответ, поэтому наиболее явный вариант — через `Handler` и `Looper.getMainLooper()`.

