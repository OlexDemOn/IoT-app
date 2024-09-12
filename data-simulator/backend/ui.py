"""
UI for user to manipulate machines and their parameters.
"""

import os
import json
import tkinter as tk
from tkinter import simpledialog, messagebox, filedialog
import datetime
import requests

import machines_configuration
import broker_configuration

SUCCESS = "Success"
ERROR = "Error"
WARNING = "Warning"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(SCRIPT_DIR, "config.json")


class BrokerConfigurationSection:
    """Handles the UI and logic for broker configuration settings."""

    def __init__(self, parent, broker_config_enabled):
        self.parent = parent
        self.broker_config_enabled = broker_config_enabled
        self.broker_frame = None
        self.broker_entry = None
        self.port_entry = None
        self.create_broker_configuration_section()


    def create_broker_configuration_section(self):
        """Creates the broker configuration UI elements."""
        self.broker_frame = tk.Frame(self.parent)
        if self.broker_config_enabled.get():
            self.broker_frame.pack(pady=10)

        tk.Label(
            self.broker_frame, text="Broker Configuration"
        ).grid(row=0, column=0, columnspan=2)
        self.create_broker_entries()

    def create_broker_entries(self):
        """Creates the entry fields for broker details."""
        tk.Label(self.broker_frame, text="MQTT Broker:").grid(row=1, column=0)
        self.broker_entry = tk.Entry(self.broker_frame)
        self.broker_entry.grid(row=1, column=1)
        self.broker_entry.insert(0, broker_configuration.MQTT_BROKER)

        tk.Label(self.broker_frame, text="MQTT Port:").grid(row=2, column=0)
        self.port_entry = tk.Entry(self.broker_frame)
        self.port_entry.grid(row=2, column=1)
        self.port_entry.insert(0, broker_configuration.MQTT_PORT)

    def save_broker_config(self):
        """Saves the broker configuration settings."""
        broker = self.broker_entry.get()
        try:
            port = int(self.port_entry.get())
        except ValueError:
            messagebox.showerror(ERROR, "Invalid port number. Please enter a valid integer.")
            return
        broker_configuration.set_broker_config(broker, port)
        broker_configuration.save_broker_config()


class MachineParameterEntry:
    """Encapsulates the widgets and logic for a machine parameter entry."""

    def __init__(self, container_frame, i, param, available_parameters, delete_callback):
        self.container_frame = container_frame
        self.i = i
        self.param = param
        self.available_parameters = available_parameters
        self.delete_callback = delete_callback
        self.entry_widgets = []
        self.create_widgets()

    def create_widgets(self):
        """Creates the widgets for a machine parameter entry."""
        self.param_entry = self.create_param_entry()
        self.topic_entry = self.create_topic_entry()
        self.unit_entry = self.create_unit_entry()
        self.start_value_entry, self.range_label = self.create_start_value_entry()
        self.delete_button = self.create_delete_button()
        self.entry_widgets = [
            self.param_entry, self.topic_entry, self.unit_entry,
            self.start_value_entry, self.range_label, self.delete_button
        ]

    def create_param_entry(self):
        """Creates and returns the parameter entry widget."""
        tk.Label(self.container_frame,
                 text=f"Parameter {self.i + 1}:").grid(row=6 * self.i, column=0, sticky="w")
        param_entry = tk.Entry(self.container_frame)
        param_entry.grid(row=6 * self.i, column=1, sticky="ew", padx=5, pady=2)
        param_entry.insert(0, self.param['parameter'])
        suggestion_listbox = tk.Listbox(self.container_frame, height=0)
        suggestion_listbox.place_forget()

        def update_suggestions(_, entry=param_entry, listbox=suggestion_listbox):
            listbox.delete(0, tk.END)
            input_text = entry.get().lower()
            matching_params = [p for p in self.available_parameters
                               if p.lower().startswith(input_text)]
            if matching_params:
                listbox.place(
                    x=entry.winfo_x(),
                    y=entry.winfo_y() + entry.winfo_height(),
                    width=entry.winfo_width(),
                )
                for p in matching_params:
                    listbox.insert(tk.END, p)
                listbox.configure(height=min(len(matching_params), 5))
                listbox.lift()
            else:
                listbox.place_forget()

        def select_suggestion(_, entry=param_entry, listbox=suggestion_listbox):
            selection_indices = listbox.curselection()
            if selection_indices:
                selection_index = selection_indices[0]
                selection = listbox.get(selection_index)
                entry.delete(0, tk.END)
                entry.insert(0, selection)
            listbox.place_forget()

        param_entry.bind('<KeyRelease>', update_suggestions)
        suggestion_listbox.bind('<ButtonRelease-1>', select_suggestion)

        return param_entry

    def create_topic_entry(self):
        """Creates and returns the topic entry widget."""
        tk.Label(self.container_frame, text="Topic:").grid(row=6 * self.i + 1, column=0, sticky="w")
        topic_entry = tk.Entry(self.container_frame)
        topic_entry.grid(row=6 * self.i + 1, column=1, sticky="ew", padx=5, pady=2)
        topic_entry.insert(0, self.param['topic'])
        topic_entry.config(state='readonly')
        return topic_entry

    def create_unit_entry(self):
        """Creates and returns the unit entry widget."""
        tk.Label(self.container_frame, text="Unit:").grid(row=6 * self.i + 2, column=0, sticky="w")
        unit_entry = tk.Entry(self.container_frame)
        unit_entry.grid(row=6 * self.i + 2, column=1, sticky="ew", padx=5, pady=2)
        unit_entry.insert(0, self.param['unit'])
        return unit_entry

    def create_start_value_entry(self):
        """Creates and returns the start value entry widget and its associated range label."""
        start_value_label = tk.Label(self.container_frame, text="Starting Value:")
        start_value_label.grid(row=6 * self.i + 3, column=0, sticky="w")
        start_value_entry = tk.Entry(self.container_frame)
        start_value_entry.grid(row=6 * self.i + 3, column=1, sticky="ew", padx=5, pady=2)
        param_range = machines_configuration.GLOBAL_PARAMETERS.get(self.param['parameter'], None)
        range_label = None
        if param_range:
            range_label = tk.Label(self.container_frame,
                                   text=f"Range: {param_range[0]} - {param_range[1]}")
            range_label.grid(row=6 * self.i + 3, column=2, sticky="w", padx=5, pady=2)
        return start_value_entry, range_label

    def create_delete_button(self):
        """Creates and returns the delete button."""
        delete_button = tk.Button(
            self.container_frame, text="X",
            command= self.delete_entry()
        )
        delete_button.grid(row=6 * self.i, column=3, sticky="e", padx=5)
        return delete_button

    def delete_entry(self):
        """Deletes the parameter entry."""
        self.delete_callback(self.i)
        for widget in self.entry_widgets:
            if widget is not None:
                try:
                    widget.destroy()
                except AttributeError:
                    pass


class MachinesConfigurationSection:
    """Handles the UI and logic for machine and global parameter configuration settings."""

    def __init__(self, parent):
        self.parent = parent
        self.machines_listbox = None
        self.param_listbox = None
        self.changes_saved = False
        self.edit_window = None
        self.create_control_buttons()

    def create_control_buttons(self):
        """Creates control buttons for opening configuration windows."""
        button_frame = tk.Frame(self.parent)
        button_frame.pack(pady=10)
        tk.Button(
            button_frame, text="Manage Machines",
            command=self.open_machine_configuration_window
        ).pack(side=tk.LEFT, padx=10)
        tk.Button(
            button_frame, text="Manage Global Parameters",
            command=self.open_global_parameters_window
        ).pack(side=tk.LEFT, padx=10)

    def open_machine_configuration_window(self):
        """Opens a new window for managing machine configurations."""
        machine_window = tk.Toplevel(self.parent)
        machine_window.title("Machines Configuration")
        machine_window.minsize(400, 300)
        self.create_machines_configuration_section(machine_window)
        machine_window.mainloop()

    def open_global_parameters_window(self):
        """Opens a new window for managing global parameters."""
        param_window = tk.Toplevel(self.parent)
        param_window.title("Global Parameters")
        param_window.minsize(400, 300)
        self.create_parameter_management_section(param_window)
        param_window.mainloop()

    def create_machines_configuration_section(self, window):
        """Creates the machine configuration UI elements in a new window."""
        frame = tk.Frame(window)
        frame.pack(pady=10)
        tk.Label(
            frame, text="Machines Configuration"
        ).grid(row=0, column=0, columnspan=3)
        self.machines_listbox = tk.Listbox(frame, height=10, width=50, selectmode=tk.MULTIPLE)
        self.machines_listbox.grid(row=1, column=0, columnspan=3)
        self.update_machines_listbox()
        self.create_machine_buttons(window)

    def create_machine_buttons(self, window):
        """Creates buttons for managing machine configurations."""
        button_frame_row1 = tk.Frame(window)
        button_frame_row1.pack(pady=5)
        tk.Button(
            button_frame_row1, text="Add Machine",
            command=self.add_machine
        ).pack(side=tk.LEFT, padx=5)
        tk.Button(
            button_frame_row1, text="Edit Machine",
            command=self.edit_machine
        ).pack(side=tk.LEFT, padx=5)
        tk.Button(
            button_frame_row1, text="Delete Machine",
            command=self.delete_machine
        ).pack(side=tk.LEFT, padx=5)
        self.create_import_export_buttons(window)

    def create_import_export_buttons(self, window):
        """Creates buttons for importing/exporting machine configurations."""
        button_frame_row2 = tk.Frame(window)
        button_frame_row2.pack(pady=5)
        tk.Button(
            button_frame_row2, text="Import Machine",
            command=self.import_machine
        ).pack(side=tk.LEFT, padx=5)
        tk.Button(
            button_frame_row2, text="Export Machine",
            command=self.export_machine
        ).pack(side=tk.LEFT, padx=5)
        button_frame_row3 = tk.Frame(window)
        button_frame_row3.pack(pady=5)
        tk.Button(
            button_frame_row3, text="Save",
            command=self.save_machine_configuration
        ).pack(side=tk.LEFT, padx=5)

    def create_parameter_management_section(self, window):
        """Creates the parameter management section UI in a new window."""
        frame = tk.Frame(window)
        frame.pack(pady=10)
        tk.Label(frame, text="Global Parameters").pack()
        self.param_listbox = tk.Listbox(frame, height=10, width=50)
        self.param_listbox.pack()
        self.update_param_listbox()
        self.create_param_buttons(window)

    def create_param_buttons(self, window):
        """Creates buttons for managing global parameters."""
        param_button_frame_row1 = tk.Frame(window)
        param_button_frame_row1.pack(pady=5)
        tk.Button(
            param_button_frame_row1, text="Add Parameter",
            command=self.add_parameter
        ).pack(side=tk.LEFT, padx=5)
        tk.Button(
            param_button_frame_row1, text="Edit Parameter",
            command=self.edit_parameter
        ).pack(side=tk.LEFT, padx=5)
        tk.Button(
            param_button_frame_row1, text="Delete Parameter",
            command=self.delete_global_parameter
        ).pack(side=tk.LEFT, padx=5)
        param_button_frame_row2 = tk.Frame(window)
        param_button_frame_row2.pack(pady=5)
        tk.Button(
            param_button_frame_row2, text="Save",
            command=self.save_global_parameters
        ).pack(side=tk.LEFT, padx=5)

    def update_machines_listbox(self):
        """Updates the machine listbox with the current machines."""
        self.machines_listbox.delete(0, tk.END)
        for machine_name, machine_info in machines_configuration.MACHINE_TYPES.items():
            display_text = f"{machine_info['id']} - {machine_name}"
            self.machines_listbox.insert(tk.END, display_text)

    def update_param_listbox(self):
        """Updates the parameter listbox with the current global parameters."""
        self.param_listbox.delete(0, tk.END)
        for param in sorted(machines_configuration.GLOBAL_PARAMETERS.keys()):
            self.param_listbox.insert(tk.END, param)

    def add_machine(self):
        """Adds a new machine to the configuration."""
        new_machine = simpledialog.askstring("Input", "Enter new machine name:")
        if new_machine:
            if new_machine in machines_configuration.MACHINE_TYPES:
                messagebox.showerror("Error", f"Machine '{new_machine}' already exists.")
            else:
                parameters = []
                machines_configuration.add_machine(new_machine, parameters)
                machines_configuration.create_machine_parameter_ranges()
                self.update_machines_listbox()
                self.changes_saved = False

    def edit_machine(self):
        """Edits the selected machine's configuration."""
        selected_machine_index = self.machines_listbox.curselection()
        if selected_machine_index:
            selected_machine = list(machines_configuration.MACHINE_TYPES.keys()
                                    )[selected_machine_index[0]]
            parameters = machines_configuration.MACHINE_TYPES[selected_machine]['parameters']
            self.edit_machine_details(selected_machine, parameters)

    def edit_machine_details(self, machine_name, parameters):
        """Opens a window to edit the details of a selected machine."""
        self.edit_window = tk.Toplevel(self.parent)
        self.edit_window.title(f"Edit {machine_name}")
        self.edit_window.minsize(400, 550)
        self.edit_window.pack_propagate(True)

        tk.Label(self.edit_window, text=f"Editing Machine: {machine_name}").pack(pady=5)
        container_frame = tk.Frame(self.edit_window)
        container_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        container_frame.grid_columnconfigure(1, weight=1)
        container_frame.grid_columnconfigure(2, weight=0)

        while len(parameters) < 4:
            parameters.append({'parameter': '', 'topic': '', 'unit': ''})

        entry_widgets = []
        available_parameters = list(machines_configuration.GLOBAL_PARAMETERS.keys())

        for i, param in enumerate(parameters):
            self.create_parameter_entry(container_frame, i, param,
                                        entry_widgets, available_parameters)

        self.finalize_edit_window(self.edit_window, machine_name, entry_widgets)

    def create_parameter_entry(self, container_frame, i, param,
                               entry_widgets, available_parameters):
        """Creates the entry widgets for machine parameters."""
        tk.Label(container_frame, text=f"Parameter {i + 1}:").grid(row=6 * i, column=0, sticky="w")
        param_entry = tk.Entry(container_frame)
        param_entry.grid(row=6 * i, column=1, sticky="ew", padx=5, pady=2)
        param_entry.insert(0, param['parameter'])
        suggestion_listbox = tk.Listbox(container_frame, height=0)
        suggestion_listbox.place_forget()

        def update_suggestions(_, entry=param_entry, listbox=suggestion_listbox):
            listbox.delete(0, tk.END)
            input_text = entry.get().lower()
            matching_params = [p for p in available_parameters if p.lower().startswith(input_text)]
            if matching_params:
                listbox.place(
                    x=entry.winfo_x(),
                    y=entry.winfo_y() + entry.winfo_height(),
                    width=entry.winfo_width(),
                )
                for p in matching_params:
                    listbox.insert(tk.END, p)
                listbox.configure(height=min(len(matching_params), 5))
                listbox.lift()
            else:
                listbox.place_forget()

        def select_suggestion(_, entry=param_entry, listbox=suggestion_listbox):
            selection_indices = listbox.curselection()
            if selection_indices:
                selection_index = selection_indices[0]
                selection = listbox.get(selection_index)
                entry.delete(0, tk.END)
                entry.insert(0, selection)
            listbox.place_forget()

        param_entry.bind('<KeyRelease>', update_suggestions)
        suggestion_listbox.bind('<ButtonRelease-1>', select_suggestion)

        tk.Label(container_frame, text="Topic:").grid(row=6 * i + 1, column=0, sticky="w")
        topic_entry = tk.Entry(container_frame)
        topic_entry.grid(row=6 * i + 1, column=1, sticky="ew", padx=5, pady=2)
        topic_entry.insert(0, param['topic'])
        topic_entry.config(state='readonly')

        tk.Label(container_frame, text="Unit:").grid(row=6 * i + 2, column=0, sticky="w")
        unit_entry = tk.Entry(container_frame)
        unit_entry.grid(row=6 * i + 2, column=1, sticky="ew", padx=5, pady=2)
        unit_entry.insert(0, param['unit'])

        start_value_label = tk.Label(container_frame, text="Starting Value:")
        start_value_label.grid(row=6 * i + 3, column=0, sticky="w")
        start_value_entry = tk.Entry(container_frame)
        start_value_entry.grid(row=6 * i + 3, column=1, sticky="ew", padx=5, pady=2)
        param_range = machines_configuration.GLOBAL_PARAMETERS.get(param['parameter'], None)
        range_label = None
        if param_range:
            range_label = tk.Label(container_frame,
                                   text=f"Range: {param_range[0]} - {param_range[1]}")
            range_label.grid(row=6 * i + 3, column=2, sticky="w", padx=5, pady=2)

        delete_button = tk.Button(
            container_frame, text="X",
            command=lambda i=i: self.delete_parameter_entry(entry_widgets, i)
        )
        delete_button.grid(row=6 * i, column=3, sticky="e", padx=5)

        entry_widgets.append([
            param_entry, topic_entry, unit_entry, start_value_entry, range_label, delete_button
        ])

    def delete_parameter_entry(self, entry_widgets, index):
        """Deletes a parameter entry."""
        for widget in entry_widgets[index]:
            if widget is not None:
                try:
                    widget.destroy()
                except AttributeError:
                    pass
        entry_widgets.pop(index)

    def finalize_edit_window(self, edit_window, machine_name, entry_widgets):
        """Finalizes the edit window by adding the save button."""
        edit_window.update_idletasks()
        edit_window.minsize(edit_window.winfo_width(), edit_window.winfo_height())
        edit_window.maxsize(edit_window.winfo_width(), edit_window.winfo_height())

        tk.Button(
            edit_window, text="Save Machine Configuration",
            command=lambda: self.save_changes(machine_name, entry_widgets)
        ).pack(pady=10, padx=10, fill=tk.X)

    def save_changes(self, machine_name, entry_widgets):
        """Collect changes and save them."""
        try:
            new_params = []
            new_state_values = {}

            for widgets in entry_widgets:
                new_param, new_state_value = self.process_widgets(widgets)
                if new_param:
                    new_params.append(new_param)
                if new_state_value:
                    new_state_values.update(new_state_value)

            if new_params:
                machines_configuration.MACHINE_TYPES[machine_name]['parameters'] = new_params
                machines_configuration.MACHINE_TYPES[machine_name]['starting_values'] = new_state_values  # Save starting values
                self.save_machine_configuration()
                self.update_machines_listbox()
                self.changes_saved = True

            messagebox.showinfo("Info", "Machine configurations saved successfully!")
        finally:
            self.edit_window.destroy()

    def process_widgets(self, widgets):
        """Process each widget and return the new parameters and state values."""
        param_entry, topic_entry, unit_entry, start_value_entry, _, __ = widgets
        if param_entry is None:
            return None, None
        parameter = param_entry.get()
        start_value = start_value_entry.get()
        if not parameter:
            return None, None

        if parameter in machines_configuration.GLOBAL_PARAMETERS:
            start_value = self.validate_start_value(parameter, start_value)
            if start_value is None:
                return None, None

        new_param = {
            'parameter': parameter,
            'topic': topic_entry.get(),
            'unit': unit_entry.get()
        }
        new_state_value = {parameter: start_value} if start_value else {}

        return new_param, new_state_value

    def validate_start_value(self, parameter, start_value):
        """Validate the start value for the parameter."""
        if start_value:
            try:
                start_value = float(start_value)
                low, high = machines_configuration.GLOBAL_PARAMETERS[parameter]
                if not low <= start_value <= high:
                    messagebox.showerror(
                        "Error",
                        f"Starting value for '{parameter}' must be within {low} - {high}.",
                    )
                    return None
            except ValueError:
                messagebox.showerror(
                    "Error", f"Invalid starting value for '{parameter}'."
                )
                return None
        return start_value

    def save_machine_configuration(self):
        """Explicitly save machine configuration and parameter ranges."""
        machines_configuration.save_machines_config()
        machines_configuration.save_parameter_ranges()
        with open(CONFIG_FILE, 'w', encoding='utf-8') as config_file:
            json.dump(machines_configuration.MACHINE_TYPES, config_file, indent=4)
        messagebox.showinfo(
            "Info", "Machine configurations and parameter ranges saved successfully."
        )

    def save_global_parameters(self):
        """Saves the global parameters and closes the global parameters window."""
        machines_configuration.save_global_parameters()
        messagebox.showinfo("Info", "Global parameters saved successfully.")

    def delete_machine(self):
        """Deletes the selected machine."""
        selected_machine_index = self.machines_listbox.curselection()
        if selected_machine_index:
            selected_machine = list(machines_configuration.MACHINE_TYPES.keys()
                                    )[selected_machine_index[0]]
            if messagebox.askokcancel(
                "Delete Machine",
                f"Are you sure you want to delete the machine '{selected_machine}'?"
            ):
                machines_configuration.delete_machine(selected_machine)
                self.update_machines_listbox()
                self.changes_saved = False

    def add_parameter(self):
        """Adds a new global parameter."""
        new_param = simpledialog.askstring("Input", "Enter new parameter name:")
        if new_param:
            range_window = tk.Toplevel(self.parent)
            range_window.title("Enter Parameter Range")

            tk.Label(range_window, text="Minimum Value:").grid(row=0, column=0, padx=5, pady=5)
            min_value_entry = tk.Entry(range_window)
            min_value_entry.grid(row=0, column=1, padx=5, pady=5)

            tk.Label(range_window, text="Maximum Value:").grid(row=1, column=0, padx=5, pady=5)
            max_value_entry = tk.Entry(range_window)
            max_value_entry.grid(row=1, column=1, padx=5, pady=5)

            def save_range():
                try:
                    low = int(min_value_entry.get())
                    high = int(max_value_entry.get())
                    if low >= high:
                        messagebox.showerror(
                            "Error", "Minimum value must be less than maximum value.",
                            parent=range_window
                        )
                        return

                    machines_configuration.add_parameter(new_param, (low, high))
                    self.save_machine_configuration()
                    self.update_param_listbox()
                    messagebox.showinfo(
                        "Success", f"Parameter '{new_param}' added with range {low}-{high}.",
                        parent=range_window
                    )
                    range_window.destroy()
                except ValueError:
                    messagebox.showerror(
                        "Error", "Please enter valid integers for the range.",
                        parent=range_window
                    )

            tk.Button(range_window, text="Save", command=save_range).grid(
                row=2, column=0, columnspan=2, pady=10
            )

    def edit_parameter(self):
        """Edits an existing global parameter."""
        selected_param_index = self.param_listbox.curselection()
        if selected_param_index:
            param_to_edit = self.param_listbox.get(selected_param_index)
            range_window = tk.Toplevel(self.parent)
            range_window.title(f"Edit Range for {param_to_edit}")

            tk.Label(range_window, text="Minimum Value:").grid(row=0, column=0, padx=5, pady=5)
            min_value_entry = tk.Entry(range_window)
            min_value_entry.grid(row=0, column=1, padx=5, pady=5)

            tk.Label(range_window, text="Maximum Value:").grid(row=1, column=0, padx=5, pady=5)
            max_value_entry = tk.Entry(range_window)
            max_value_entry.grid(row=1, column=1, padx=5, pady=5)

            def save_range():
                try:
                    low = int(min_value_entry.get())
                    high = int(max_value_entry.get())
                    if low >= high:
                        messagebox.showerror(
                            "Error", "Minimum value must be less than maximum value.",
                            parent=range_window
                        )
                        return

                    machines_configuration.add_parameter(param_to_edit, (low, high))
                    self.save_machine_configuration()
                    self.update_param_listbox()
                    messagebox.showinfo(
                        "Success", f"Parameter '{param_to_edit}' updated to range {low}-{high}.",
                        parent=range_window
                    )
                    range_window.destroy()
                except ValueError:
                    messagebox.showerror(
                        "Error", "Please enter valid integers for the range.",
                        parent=range_window
                    )

            tk.Button(range_window, text="Save", command=save_range).grid(
                row=2, column=0, columnspan=2, pady=10
            )
        else:
            messagebox.showwarning("Warning", "Please select a parameter to edit.")

    def delete_global_parameter(self):
        """Deletes a global parameter."""
        param_to_delete = self.param_listbox.get(tk.ACTIVE)
        if param_to_delete:
            machines_configuration.remove_parameter(param_to_delete)
            self.update_param_listbox()
            messagebox.showinfo("Success", f"Parameter '{param_to_delete}' has been deleted.")
        else:
            messagebox.showwarning("Warning", "No parameter selected to delete")

    def import_machine(self):
        """Handles importing machine configurations from a JSON file."""
        import_file = filedialog.askopenfilename(
            title="Select Machine JSON File",
            filetypes=[("JSON files", "*.json")]
        )
        if not import_file:
            return

        try:
            with open(import_file, "r", encoding="utf-8") as file:
                machines_data = json.load(file)
            if not isinstance(machines_data, dict):
                messagebox.showerror(ERROR, "Invalid data format in imported file.")
                return

            for machine_name, machine_info in machines_data.items():
                if 'parameters' not in machine_info:
                    messagebox.showerror(
                        ERROR, f"Invalid data format for machine '{machine_name}'."
                    )
                    return
                if machine_name in machines_configuration.MACHINE_TYPES:
                    messagebox.showerror(ERROR, f"Machine '{machine_name}' already exists.")
                    continue

                machines_configuration.add_machine(machine_name, machine_info['parameters'])

            self.update_machines_listbox()
            messagebox.showinfo(SUCCESS, "Machines imported successfully.")
        except json.JSONDecodeError:
            messagebox.showerror(ERROR, "Invalid JSON format.")
        except IOError as e:
            messagebox.showerror(ERROR, f"Failed to import machines. Error: {str(e)}")

    def export_machine(self):
        """Handles exporting selected machine configurations to a JSON file."""
        selected_machine_indices = self.machines_listbox.curselection()
        if not selected_machine_indices:
            messagebox.showwarning(WARNING, "No machines selected for export.")
            return

        exported_data = {}
        for index in selected_machine_indices:
            machine_name = list(machines_configuration.MACHINE_TYPES.keys())[index]
            machine_data = machines_configuration.MACHINE_TYPES[machine_name]
            exported_data[machine_name] = {
                'parameters': machine_data['parameters']
            }

        export_file = os.path.join(SCRIPT_DIR, "exported_machines.json")
        try:
            with open(export_file, "w", encoding="utf-8") as file:
                json.dump(exported_data, file, indent=4)
            messagebox.showinfo(
                SUCCESS, f"Selected machines exported successfully to '{export_file}'."
            )
        except IOError as e:
            messagebox.showerror(ERROR, f"Failed to export machines. Error: {str(e)}")



class PastDataGeneratorSection:
    """Handles the generation of past data for machines."""

    def __init__(self, parent):
        self.parent = parent
        self.machine_entry = None
        self.start_date_entry = None
        self.end_date_entry = None
        self.interval_entry = None
        self.create_generate_past_data_button()

    def create_generate_past_data_button(self):
        """Creates the button for generating past data."""
        frame = tk.Frame(self.parent)
        frame.pack(pady=10)
        tk.Button(
            frame, text="Generate Past Data",
            command=self.open_generate_past_data_window
        ).pack(side=tk.LEFT, padx=5)

    def open_generate_past_data_window(self):
        """Opens a new window for generating past data."""
        generate_data_window = tk.Toplevel(self.parent)
        generate_data_window.title("Generate Past Data")
        generate_data_window.pack_propagate(False)
        generate_data_window.grid_propagate(False)
        generate_data_window.update_idletasks()
        self.create_machine_selection(generate_data_window)
        self.create_date_selection(generate_data_window)
        self.create_interval_selection(generate_data_window)
        tk.Button(generate_data_window, text="Generate", command=self.generate_data).grid(
            row=4, column=0, columnspan=2, pady=10
        )

        generate_data_window.update_idletasks()
        generate_data_window.minsize(generate_data_window.winfo_width(),
                                     generate_data_window.winfo_height())
        generate_data_window.grid_propagate(True)
        generate_data_window.pack_propagate(True)
        generate_data_window.mainloop()

    def create_machine_selection(self, parent):
        """Creates the machine selection section in the past data generator window."""
        tk.Label(
            parent, text="Select Machine:"
        ).grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.machine_entry = tk.Entry(parent)
        self.machine_entry.grid(row=0, column=1, padx=5, pady=5, sticky="ew")
        self.machine_entry.focus_set()
        suggestion_listbox = tk.Listbox(parent, height=0)
        suggestion_listbox.place_forget()

        def update_suggestions(_):
            suggestion_listbox.delete(0, tk.END)
            input_text = self.machine_entry.get().lower()
            matching_machines = [
                m for m in machines_configuration.MACHINE_TYPES
                if m.lower().startswith(input_text)
            ]
            if matching_machines:
                suggestion_listbox.place(
                    x=self.machine_entry.winfo_x(),
                    y=self.machine_entry.winfo_y() + self.machine_entry.winfo_height(),
                    width=self.machine_entry.winfo_width(),
                )
                for m in matching_machines:
                    suggestion_listbox.insert(tk.END, m)
                suggestion_listbox.configure(height=min(len(matching_machines), 5))
                suggestion_listbox.lift()
            else:
                suggestion_listbox.place_forget()

        def select_suggestion(_):
            selection_indices = suggestion_listbox.curselection()
            if selection_indices:
                selection_index = selection_indices[0]
                selection = suggestion_listbox.get(selection_index)
                self.machine_entry.delete(0, tk.END)
                self.machine_entry.insert(0, selection)
            suggestion_listbox.place_forget()

        self.machine_entry.bind('<KeyRelease>', update_suggestions)
        suggestion_listbox.bind('<ButtonRelease-1>', select_suggestion)

    def create_date_selection(self, parent):
        """Creates the start and end date selection section in the past data generator window."""
        tk.Label(
            parent, text="Start Date (YYYY-MM-DD):"
        ).grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.start_date_entry = tk.Entry(parent)
        self.start_date_entry.grid(row=1, column=1, padx=5, pady=5, sticky="ew")

        tk.Label(
            parent, text="End Date (YYYY-MM-DD):"
        ).grid(row=2, column=0, padx=5, pady=5, sticky="w")
        self.end_date_entry = tk.Entry(parent)
        self.end_date_entry.grid(row=2, column=1, padx=5, pady=5, sticky="ew")

    def create_interval_selection(self, parent):
        """Creates the interval selection section in the past data generator window."""
        tk.Label(
            parent, text="Interval in Seconds:"
        ).grid(row=3, column=0, padx=5, pady=5, sticky="w")
        self.interval_entry = tk.Entry(parent)
        self.interval_entry.insert(0, "60")
        self.interval_entry.grid(row=3, column=1, padx=5, pady=5, sticky="ew")

    def generate_data(self):
        """Generates past data for the selected machine within the range/interval."""
        machine_name = self.machine_entry.get().strip()
        start_date = self.start_date_entry.get().strip()
        end_date = self.end_date_entry.get().strip()
        interval_seconds = self.interval_entry.get().strip()

        if not machine_name:
            messagebox.showerror(ERROR, "Machine name is required.")
            return

        if machine_name not in machines_configuration.MACHINE_TYPES:
            messagebox.showerror(ERROR, "Invalid machine name selected.")
            return

        try:
            datetime.datetime.strptime(start_date, "%Y-%m-%d")
            datetime.datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            messagebox.showerror(ERROR, "Invalid date format. Please use YYYY-MM-DD.")
            return

        try:
            interval_seconds = int(interval_seconds)
        except ValueError:
            messagebox.showerror(ERROR, "Interval must be an integer.")
            return

        try:
            response = requests.post(
                "http://localhost:5000/generate-past-data",
                json={
                    "machine_name": machine_name,
                    "start_date": start_date,
                    "end_date": end_date,
                    "interval_seconds": interval_seconds
                },
                timeout=10  # Add a timeout of 10 seconds
            )
            response_data = response.json()
            if response.status_code == 200:
                generated_data = response_data.get("generated_data", [])
                display_data = "\n".join([
                    f"{data['timestamp']} - {data['parameter']} ({data['topic']}): "
                    f"{data['value']} {data['unit']}"
                    for data in generated_data
                ])
                messagebox.showinfo(SUCCESS, f"Past data generated successfully!\n\n{display_data}")
            else:
                messagebox.showerror(ERROR, response_data.get("error", "Unknown error occurred"))
        except requests.Timeout:
            messagebox.showerror(ERROR, "The request timed out. Please try again.")
        except requests.RequestException as e:
            messagebox.showerror(ERROR, f"Request failed: {str(e)}")


class ControlButtonsSection:
    """Handles the creation and logic of the control buttons in the UI."""

    def __init__(self, parent, broker_section, machines_section):
        self.parent = parent
        self.broker_section = broker_section
        self.machines_section = machines_section
        self.create_control_buttons()

    def create_control_buttons(self):
        """Creates the main control buttons and their layout."""
        group1_frame = tk.Frame(self.parent)
        group1_frame.pack(pady=10)
        self.add_save_exit_buttons(group1_frame)

    def add_save_exit_buttons(self, frame):
        """Adds buttons to save and exit the application."""
        tk.Button(frame, text="Save", command=self.save_all).pack(side=tk.LEFT, padx=5)
        tk.Button(frame, text="Save and Exit",
                  command=self.confirm_save_and_exit).pack(side=tk.LEFT, padx=5)
        tk.Button(frame, text="Exit", command=self.confirm_exit).pack(side=tk.LEFT, padx=5)

    def save_all(self):
        """Saves all configurations including broker and machine settings."""
        self.broker_section.save_broker_config()
        for machine_name in machines_configuration.MACHINE_TYPES:
            machines_configuration.generate_topics_for_machine(machine_name)
        machines_configuration.create_machine_parameter_ranges()
        machines_configuration.save_machines_config()
        messagebox.showinfo("Info", "All configurations and topics saved successfully!")

    def confirm_save_and_exit(self):
        """Saves all configurations and exits the application."""
        if messagebox.askokcancel("Save and Exit", "Do you want to save all changes and exit?"):
            self.save_all()
            self.parent.quit()
            self.parent.destroy()

    def confirm_exit(self):
        """Confirms and exits the application."""
        if self.machines_section.changes_saved:
            self.parent.quit()
            self.parent.destroy()
        else:
            if messagebox.askokcancel("Exit", "Do you want to exit without saving changes?"):
                self.parent.quit()
                self.parent.destroy()


class ConfigurationUI:
    """Main class that integrates all UI sections and manages the application lifecycle."""

    def __init__(self, main_window):
        self.root = main_window
        self.root.title("Configuration UI")
        self.broker_config_enabled = tk.BooleanVar(value=True)
        self.broker_section = BrokerConfigurationSection(main_window, self.broker_config_enabled)
        self.machines_section = MachinesConfigurationSection(main_window)
        self.past_data_generator_section = PastDataGeneratorSection(main_window)
        self.control_buttons_section = ControlButtonsSection(
            main_window, self.broker_section, self.machines_section
        )

    def run(self):
        """Run the Tkinter main loop."""
        self.root.mainloop()

    def get_broker_section(self):
        """Return the broker configuration section."""
        return self.broker_section

    def get_machines_section(self):
        """Return the machines configuration section."""
        return self.machines_section


if __name__ == "__main__":
    root = tk.Tk()
    app = ConfigurationUI(root)
    root.mainloop()
