// script.js
// Simple todo app with localStorage and filter/edit/delete
const form = document.getElementById("todo-form")
const taskInput = document.getElementById("task-input")
const dateInput = document.getElementById("date-input")
const body = document.getElementById("todo-body")
const filter = document.getElementById("filter")
const deleteAllBtn = document.getElementById("delete-all")

let todos = [] // {id, text, due, done}
let editId = null

function load() {
  const raw = localStorage.getItem("todos_v1")
  todos = raw ? JSON.parse(raw) : []
  render()
}

function save() {
  localStorage.setItem("todos_v1", JSON.stringify(todos))
}

// utility id
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function render() {
  // clear
  body.innerHTML = ""

  const mode = filter.value // all | active | completed
  const filtered = todos.filter((t) => {
    if (mode === "active") return !t.done
    if (mode === "completed") return t.done
    return true
  })

  if (filtered.length === 0) {
    const tr = document.createElement("tr")
    tr.className = "empty"
    tr.innerHTML = `<td colspan="4" class="no-task">No task found</td>`
    body.appendChild(tr)
    return
  }

  filtered.forEach((t) => {
    const tr = document.createElement("tr")

    // task cell
    const tdTask = document.createElement("td")
    const txt = document.createElement("div")
    txt.style.display = "flex"
    txt.style.alignItems = "center"
    txt.style.gap = "10px"

    // checkbox
    const cb = document.createElement("input")
    cb.type = "checkbox"
    cb.checked = t.done
    cb.addEventListener("change", () => toggleDone(t.id))

    const span = document.createElement("span")
    span.textContent = t.text
    span.style.color = "#e6eef8"
    span.style.fontWeight = "600"
    if (t.done) {
      span.style.textDecoration = "line-through"
      span.style.opacity = "0.7"
    }

    txt.appendChild(cb)
    txt.appendChild(span)
    tdTask.appendChild(txt)
    tr.appendChild(tdTask)

    // due
    const tdDue = document.createElement("td")
    tdDue.textContent = t.due ? formatDate(t.due) : "-"
    tr.appendChild(tdDue)

    // status
    const tdStatus = document.createElement("td")
    const badge = document.createElement("span")
    badge.className = "badge " + (t.done ? "done" : "active")
    badge.textContent = t.done ? "Completed" : "Active"
    tdStatus.appendChild(badge)
    tr.appendChild(tdStatus)

    // actions
    const tdAct = document.createElement("td")
    const edit = document.createElement("button")
    edit.className = "action-btn"
    edit.textContent = "Edit"
    edit.title = "Edit"
    edit.addEventListener("click", () => startEdit(t.id))

    const del = document.createElement("button")
    del.className = "action-btn"
    del.textContent = "Delete"
    del.title = "Delete"
    del.style.marginLeft = "8px"
    del.style.borderColor = "rgba(255,0,0,0.06)"
    del.addEventListener("click", () => removeTodo(t.id))

    tdAct.appendChild(edit)
    tdAct.appendChild(del)
    tr.appendChild(tdAct)

    body.appendChild(tr)
  })
}

function formatDate(iso) {
  // iso YYYY-MM-DD -> display mm/dd/yyyy (as image placeholder)
  const d = new Date(iso)
  if (isNaN(d)) return iso
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${mm}/${dd}/${yyyy}`
}

function addTodo(text, due) {
  const item = { id: uid(), text: text.trim(), due: due || "", done: false }
  todos.unshift(item)
  save()
  render()
}

function startEdit(id) {
  const t = todos.find((x) => x.id === id)
  if (!t) return
  editId = id
  taskInput.value = t.text
  dateInput.value = t.due || ""
  taskInput.focus()
}

function updateTodo(id, text, due) {
  const t = todos.find((x) => x.id === id)
  if (!t) return
  t.text = text.trim()
  t.due = due || ""
  save()
  editId = null
  render()
}

function removeTodo(id) {
  todos = todos.filter((x) => x.id !== id)
  save()
  render()
}

function toggleDone(id) {
  const t = todos.find((x) => x.id === id)
  if (!t) return
  t.done = !t.done
  save()
  render()
}

form.addEventListener("submit", (e) => {
  e.preventDefault()
  const text = taskInput.value
  const due = dateInput.value
  if (!text.trim()) return
  if (editId) {
    updateTodo(editId, text, due)
  } else {
    addTodo(text, due)
  }
  form.reset()
  editId = null
})

filter.addEventListener("change", render)
deleteAllBtn.addEventListener("click", () => {
  if (!confirm("Delete ALL tasks?")) return
  todos = []
  save()
  render()
})

// initial load
load()
