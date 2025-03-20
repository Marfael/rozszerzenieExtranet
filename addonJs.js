document.getElementById('box-documents').textContent = '';

var checkboxObecnosc = document.querySelectorAll("input[type=checkbox][class='checkboxObecnosc'")

var banner = document.getElementById('box-calendar')
banner.parentElement.removeChild(banner);
const divGlowny = document.createElement("div")
document.getElementById('box-documents').appendChild(divGlowny)
const div0 = document.createElement("div")
const div1 = document.createElement("div")
const div2 = document.createElement("div")
const div3 = document.createElement("div")
const div4 = document.createElement("div")
divGlowny.appendChild(div0)
divGlowny.appendChild(div1)
divGlowny.appendChild(div2)
divGlowny.appendChild(div3)
document.getElementById('box-documents').appendChild(div4)
div2.setAttribute("id", "box-obecnosci")
div3.setAttribute("id", "box-usprawiedliwienie")
div4.setAttribute("id", "animacjaLadowanie")
div4.style.setProperty("pointer-events", "none")
div1.innerHTML = '<input type="date" id="startDate" /><input type="date" id="endDate" /><input type="button" id="searchButton" value="Szukaj" />'
div3.innerHTML = '<textarea id="textarea-usprawiedliwienie" rows=4 cols=40 placeholder="Wpisz tutaj swoje usprawiedliwienie"></textarea><input type="button" id="wyslijUsprawiedliwienie" value="Wyślij" />'


const buttonSearch = document.getElementById('searchButton')

const textboxUsprawiedliwienie = document.getElementById("textarea-usprawiedliwienie")

const przyciskUsprawiedliwienie = document.getElementById("wyslijUsprawiedliwienie")

document.querySelectorAll('.record').forEach(zapisy => {
    zapisy.style.setProperty('border-bottom', 'none', 'important')
})

function przyciskiSemestry() {
    const daneSemestry = fetch("http://127.0.0.1:8000/pobierzSemestry", {
        method: "GET",
    })
    .then(function(response) { return response.json(); })
    .then(function(json) {
        console.log(json)
        console.log(json[0])
        var lista = '<select name="templates" id="templates">'
        const p = (Object.keys(json).length)/3
        var a = 0
        for (let i = 0; i < p; i++) {
            lista += '<option value="' + json[i+a] + '" startDate="' + json[i+1+a] + '" endDate="' + json[i+2+a] + '">' + json[i+a] + '</option>'
            a += 2
        }
        div0.innerHTML = lista + '</select><input type="button" id="templateSearchButton" value="Szukaj" />'
        const przyciskTemplate = document.getElementById('templateSearchButton')
        przyciskTemplate.addEventListener("click", function(){
            const element = document.getElementById('templates')
            const selected = element.options[element.selectedIndex]
            const startDate = selected.attributes.startDate.value
            const endDate = selected.attributes.endDate.value
            pobierzDane(startDate, endDate)
        })
    });
    
}

przyciskiSemestry()

function odswiezListe(dane){
    var result1 = '<table><tr><td><input type="checkbox" id="checkboxObecnoscAll" /></td><td>Zaznacz Wszystkie</td></tr>';
    dane.sort((a,b) => (a.start > b.start) ? 1 : -1)
    dane.forEach(function (item){
        var data0 = Date.parse(item.start)
        var data = new Date(data0)
        var rok = data.getFullYear()
        var miesiac = data.getMonth()+1
        var dzien = data.getDate()
        var godzina = data.getHours()
        var minuta = data.getMinutes()
        result1 += '<tr><td><input type="checkbox" class="checkboxObecnosc" idLekcji="' + item.id + '" /></td><td>' + dzien + "." + miesiac + "." + rok + " " + godzina + ":" + minuta + ", " + item.title + "</td></tr>";
    });

    document.getElementById('box-obecnosci').textContent = '';

    document.getElementById('box-obecnosci').innerHTML = result1 + "</table>";

    checkboxObecnosc = document.querySelectorAll("input[type=checkbox][class='checkboxObecnosc'")
    checkboxEvent()
}


function pobierzDane(startDate, endDate){
    const formData = new FormData();

    formData.append("frekwencja", true)
    formData.append("start", startDate)
    formData.append("end", endDate)

    divGlowny.style.setProperty('filter', 'blur(3px)')

    fetch("https://extranet-azymut.e-sence.net.pl/plan-zajec/pobierz", {
        method: "POST",
        body: formData
    })
    .then(function(response) { divGlowny.style.setProperty('filter', 'blur(0px)'); return response.json(); })
    .then(function(json) {
      odswiezListe(json.filter(e => e.nieobecny === 1));
    });
}

function pobierzAktualnyTydzien() {
    const now = new Date()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), startOfWeek.getDate() + 7)

    console.log(startOfWeek, endOfWeek)

    pobierzDane(startOfWeek.toJSON(), endOfWeek.toJSON())
}

function checkboxChange(checkbox){
    console.log(checkbox)
}

buttonSearch.addEventListener("click", function(){
    const startDate = document.getElementById('startDate')
    const endDate = document.getElementById('endDate')

    const startDateJSON = new Date(startDate.value).toJSON()
    const endDateJSON = new Date(endDate.value).toJSON()

    pobierzDane(startDateJSON, endDateJSON)
})

przyciskUsprawiedliwienie.addEventListener("click", function(){
    const formData = new FormData();

    const wiadomosc = document.getElementById("textarea-usprawiedliwienie").value

    formData.append("typ", 1)
    formData.append("rodzaj_uspraw", "u")
    formData.append("opis", wiadomosc)

    divGlowny.style.setProperty('filter', 'blur(3px)')

    fetch("https://extranet-azymut.e-sence.net.pl/nieobecnosci/stworz", {
        method: "POST",
        body: formData
    })
})



function dodajUspr(id, rodzaj){
    if (rodzaj) {
        const formData = new FormData();

        formData.append("check", true)
        formData.append("id", id)

        fetch("https://extranet-azymut.e-sence.net.pl/nieobecnosci/dodaj", {
            method: "POST",
            body: formData
        })
    } else {
        const formData = new FormData();

        formData.append("check", false)
        formData.append("id", id)

        fetch("https://extranet-azymut.e-sence.net.pl/nieobecnosci/dodaj", {
            method: "POST",
            body: formData
        })
    }
}

function checkboxEvent(){
    const checkboxAll = document.getElementById("checkboxObecnoscAll")
    checkboxAll.addEventListener("change", function(){
        for(var i=0, n=checkboxObecnosc.length;i<n;i++) {
            console.log(checkboxObecnosc[i].getAttribute("idLekcji") + checkboxAll.checked)
            checkboxObecnosc[i].checked = checkboxAll.checked;
            dodajUspr(checkboxObecnosc[i].getAttribute("idLekcji"), checkboxAll.checked)
        }
    })
    checkboxObecnosc.forEach(function(checkbox){
        checkbox.addEventListener('change', function(){
            if (this.checked) {
                dodajUspr(this.getAttribute("idLekcji"), true)
            } else {
                dodajUspr(this.getAttribute("idLekcji"), false)
            }
        })
    })
}


pobierzAktualnyTydzien()