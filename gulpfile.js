import browserSync from "browser-sync" //import назва(для нас) from "назва плагіну"
import gulp from "gulp"
import del from "del"
import pug from "gulp-pug"
import coreSass from "sass"
import gulpSass from "gulp-sass"
import autoprefixer from "gulp-autoprefixer"
import concat from "gulp-concat"
import uglify from "gulp-uglify-es"
import notify from "gulp-notify"
import imagemin from "gulp-imagemin"
import cache from "gulp-cache"
import gcmq from "gulp-group-css-media-queries"
import cleanCSS from "gulp-clean-css"
import rename from "gulp-rename"

const sass = gulpSass(coreSass) // працюють лише в склейці ()маємо просто змінну сасс)

export const browserSyncFunc = () => { // стрілочна функція, аналог function(), не передає контекст
    browserSync({
        server: {
            baseDir: "docs" // за якою папкою буде слідкувати
        },
        open: true, // перевіряє чи запускати браузер
        notyfi: true, // перевіряє на підсвітку помилок (і в браузері)
        browser: "chrome"
        // port:8080 // приконфлікті портів можем використати власний порт
    })
}

export const html = () => { // для створення HTML
    return gulp // повертає декілька викликів як одне ціле через цепочку послідовностей chain
    .src([ // робоча папка з якої беруться файли на компіляцію
        "src/pug/*.pug" // звідки брати вихідні данні/в папці паг/з розширеням паг
    ])
    .pipe(pug({ // піпе метод який зєднує виклики
        //pretty: true //якщо ввімкнено, то HTML буде не мініфікована, без нього в одну стрічку мініфікована
    }))
    .pipe(gulp.dest("docs")) // dest-куди, в папку докс
    .pipe(browserSync.reload({ // слідкує і оновлює сторінку
        stream: true
    }))
}

export const css = () => {
    return gulp
    .src([
        "src/sass/*.css", // в форматі css можна підключати якісь бібліотеки
        "src/sass/*.sass"
    ])
    .pipe(sass({
        outputStyle: "compressed" //expanded, compact //експандед стандартний вигляд css, компрес(видаляє коментарі пробіли переноси і тд) все в одну стрічку
    })
    .on("error", sass.logError) // висвічує помилки в випливаючумо вікні
    .on("error", notify.onError())) // то саме але в консоль
    .pipe(autoprefixer(["last 15 version"], { // префікси якщо потрібно
        cascade: true // зберігається каскадність пріорітету
    }))
    .pipe(gcmq("styles.css")) // виноситьь медіа запити в кінець Css
    .pipe(concat("styles.css")) // зліплює все в файл Css (якщо потрібні різні css файли, то видаляємо стрічку)
    .pipe(cleanCSS({ // робить сумісність з інтернет експолером
        compatibility: "ie8"
    }))
    .pipe(gulp.dest("docs/css"))
    .pipe(browserSync.reload({
        stream: true
    }))
}

export const js = () => {
    return gulp
    .src([
        "src/js/**/*.js" // будь яка вложеність, будь який файл з розширенням js
    ])
    .pipe(uglify.default()) // мініфікує js в одну змінну, переіменовує змінних (мініфікує- в одну стрічку)
    .pipe(concat("scripts.js"))
    .pipe(gulp.dest("docs/js"))
    .pipe(browserSync.reload({
        stream: true
    }))
}

// export const php = () => { 
//     return gulp
//     .src([
//         "src/pug/thanks.pug"
//     ])
//     .pipe(pug())
//     .pipe(rename({
//         extname: ".php"
//     }))
//     .pipe(gulp.dest(("docs")))
//     .pipe(browserSync.reload({
//         stream: true
//     }))
// }

export const files = () => {
    return gulp
    .src([
        "src/*.*" // щоб переміщати файли з кореню проекту в в фінальну папку (корінь докс)
    ], {dot: true}) // якщо файл без назви(тільки розширення) він всеодно їх копіює
    .pipe(gulp.dest("docs"))
    .pipe(browserSync.reload({
        stream: true
    }))
}

export const fonts = () => {
    return gulp
    .src([
        "src/fonts/**/*.*" //схожий на файлс
    ])
    .pipe(gulp.dest("docs/fonts"))
    .pipe(browserSync.reload({
        stream: true
    }))
}

export const images = () => {
    return gulp
    .src([
        "src/img/**/*"
    ])
    .pipe(cache(imagemin())) // стискає зображення і кешує, щоб знову не стискати
    .pipe(gulp.dest("docs/img"))
    .pipe(browserSync.reload({
        stream: true
    }))
}

export const clear = () => {
    return cache.clearAll() // для очистки кешу
}

export const delDocs = () => {
    return del("docs") // видаляє папку докс для збереження актуальності данних(не захламляти фінальний проект)
}

export const watch = () => { // воч слідкує за змінами
    gulp.watch("src/sass/**/*.sass", gulp.parallel(css))
    gulp.watch("src/pug/**/*.pug", gulp.parallel(html))
    gulp.watch("src/js/**/*.js", gulp.parallel(js))
    // gulp.watch("src/php/**/*.php", gulp.parallel(php))
    gulp.watch("src/*.*", gulp.parallel(files))
    gulp.watch("src/fonts/**/*.*", gulp.parallel(fonts))
    gulp.watch("src/img/**/*.*", gulp.parallel(images))
}

export default gulp.series( // дефолтний таск з назвою gulp, серія викликів
    delDocs, // видаляє папку докс
    gulp.parallel( // паралельно запускає інші таски
        watch,
        html,
        css,
        js,
        // php,
        files,
        fonts,
        images,
        browserSyncFunc
    )
)

// Local: http://localhost:3000 локальна адреса для компа
// External: http://172.16.10.172:3000 зовнішня адреса для інших девайсів
// для того щоб зупинити будь-який процес в терміналі ctrl+c