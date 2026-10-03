# H. Android networkText

Выполняем запрос в сеть в отдельном потоке. Как правильно установить данные из сети в `TextView`?

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
