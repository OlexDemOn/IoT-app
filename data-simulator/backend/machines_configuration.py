"""
File to store and process machine configuration.
"""

import inspect

MACHINE_TYPES = {
    'DrillingMachine': {
        'id': 1,
        'parameters': [
            {"parameter": "DrillingSpeed", "topic": "ZG/drilling/PLC/1/speed", "unit": "rpm"},
            {"parameter": "Torque", "topic": "ZG/drilling/PLC/1/torque", "unit": "kNm"},
            {"parameter": "BeltSpeed", "topic": "ZG/drilling/PLC/1/belt_speed", "unit": "%"},
            {"parameter": "Temperature", "topic": "ZG/drilling/PLC/1/temperature", "unit": "°C"},
        ],
    },
    'SolderingMachine': {
        'id': 2,
        'parameters': [
            {"parameter": "Power", "topic": "ZG/soldering/PLC/2/power", "unit": "W"},
            {"parameter": "BeltSpeed", "topic": "ZG/soldering/PLC/2/belt_speed", "unit": "%"},
            {"parameter": "Temperature", "topic": "ZG/soldering/PLC/2/temperature", "unit": "°C"},
            {"parameter": "Speed", "topic": "ZG/soldering/PLC/2/speed", "unit": "m/s"},
        ],
    },
    'WeldingMachine': {
        'id': 3,
        'parameters': [
            {"parameter": "GasFlow", "topic": "ZG/welding/PLC/3/gas_flow", "unit": "L/min"},
            {"parameter": "BeltSpeed", "topic": "ZG/welding/PLC/3/belt_speed", "unit": "%"},
            {"parameter": "Temperature", "topic": "ZG/welding/PLC/3/temperature", "unit": "°C"},
            {"parameter": "Speed", "topic": "ZG/welding/PLC/3/speed", "unit": "%"},
        ],
    },
    'AssemblyMachine': {
        'id': 4,
        'parameters': [
            {"parameter": "Pressure", "topic": "ZG/assemble/PLC/4/pressure", "unit": "Pa"},
            {"parameter": "BeltSpeed", "topic": "ZG/assemble/PLC/4/belt_speed", "unit": "%"},
            {"parameter": "Speed", "topic": "ZG/assemble/PLC/4/speed", "unit": "%"},
        ],
    },
}


GLOBAL_PARAMETERS = {
    'DrillingSpeed': (200, 6000),
    'Torque': (2, 40),
    'BeltSpeed': (0, 100),
    'Temperature': (10, 2000),
    'Power': (15, 50),
    'GasFlow': (1, 10),
    'Pressure': (0, 7),
    'Speed': (0, 100),
}


PARAMETER_RANGES = {
    'DrillingMachine': {
        'DrillingSpeed': (200, 6000),
        'Torque': (2, 40),
        'BeltSpeed': (0, 100),
        'Temperature': (10, 2000),
    },
    'SolderingMachine': {
        'Power': (15, 50),
        'BeltSpeed': (0, 100),
        'Temperature': (10, 2000),
        'Speed': (0, 100),
    },
    'WeldingMachine': {
        'GasFlow': (1, 10),
        'BeltSpeed': (0, 100),
        'Temperature': (10, 2000),
        'Speed': (0, 100),
    },
    'AssemblyMachine': {
        'Pressure': (0, 7),
        'BeltSpeed': (0, 100),
        'Speed': (0, 100),
    },

}

current_id = max((info['id'] for info in MACHINE_TYPES.values()), default=0)

def generate_topics_for_machine(machine_name):
    """Generate topic strings for the machine parameters."""
    machine_info = MACHINE_TYPES.get(machine_name)
    if machine_info:
        index_id = machine_info['id']
        for param in machine_info['parameters']:
            prefix = machine_name[:3].upper()
            suffix = param['parameter'].upper() if param['parameter'] else ''
            param['topic'] = f"ZG/{prefix}/{index_id}/{suffix}"


def regenerate_parameter_ranges():
    """Regenerate PARAMETER_RANGES based on the current MACHINE_TYPES."""
    global PARAMETER_RANGES  # pylint: disable=global-statement
    PARAMETER_RANGES = {}
    for machine_name, machine_info in MACHINE_TYPES.items():
        PARAMETER_RANGES[machine_name] = {}
        for param in machine_info['parameters']:
            param_name = param['parameter']
            if param_name in GLOBAL_PARAMETERS:
                PARAMETER_RANGES[machine_name][param_name] = GLOBAL_PARAMETERS[param_name]
            else:
                PARAMETER_RANGES[machine_name][param_name] = (0, 0)


def add_machine(machine_name, parameters):
    """Add a new machine to the configuration."""
    global current_id  # pylint: disable=global-statement
    current_id += 1
    MACHINE_TYPES[machine_name] = {
        'id': current_id,
        'parameters': parameters
    }
    generate_topics_for_machine(machine_name)
    save_machines_config()
    save_parameter_ranges()


def delete_machine(machine_name):
    """Delete a machine from the configuration."""
    if machine_name in MACHINE_TYPES:
        del MACHINE_TYPES[machine_name]
        save_machines_config()

    if machine_name in PARAMETER_RANGES:
        del PARAMETER_RANGES[machine_name]
        save_parameter_ranges()


def add_parameter(parameter_name, range_values):
    """Add a global parameter with its range."""
    if parameter_name not in GLOBAL_PARAMETERS:
        GLOBAL_PARAMETERS[parameter_name] = range_values
    save_global_parameters()


def add_parameter_to_machine(machine_name, parameter_name):
    """Add an existing global parameter to a specific machine."""
    if machine_name in MACHINE_TYPES and parameter_name in GLOBAL_PARAMETERS:
        if machine_name not in PARAMETER_RANGES:
            PARAMETER_RANGES[machine_name] = {}
        PARAMETER_RANGES[machine_name][parameter_name] = GLOBAL_PARAMETERS[parameter_name]
        params = MACHINE_TYPES[machine_name]['parameters']
        if not any(param['parameter'] == parameter_name for param in params):
            params.append({
                'parameter': parameter_name,
                'topic': '',
                'unit': ''
            })

        generate_topics_for_machine(machine_name)
        save_machines_config()
        save_parameter_ranges()


def remove_parameter(parameter_name):
    """Remove a parameter from all machines and from the global parameter list."""
    if parameter_name in GLOBAL_PARAMETERS:
        del GLOBAL_PARAMETERS[parameter_name]
        save_global_parameters()

    for params in PARAMETER_RANGES.values():
        if parameter_name in params:
            del params[parameter_name]

    for machine_info in MACHINE_TYPES.values():
        machine_info['parameters'] = [
            param for param in machine_info['parameters']
            if param['parameter'] != parameter_name
        ]
    save_machines_config()
    save_parameter_ranges()


def create_machine_parameter_ranges():
    """Automatically create parameter ranges for machines in MACHINE_TYPES."""
    for machine_name, machine_info in MACHINE_TYPES.items():
        if machine_name not in PARAMETER_RANGES:
            PARAMETER_RANGES[machine_name] = {}

        for param in machine_info['parameters']:
            param_name = param['parameter']
            if param_name in GLOBAL_PARAMETERS:
                PARAMETER_RANGES[machine_name][param_name] = GLOBAL_PARAMETERS[param_name]


def save_global_parameters():
    """Save the current global parameters to the script."""
    current_file = inspect.getfile(inspect.currentframe())
    with open(current_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    start_idx = None
    end_idx = None
    for i, line in enumerate(lines):
        if line.strip().startswith('GLOBAL_PARAMETERS = {'):
            start_idx = i
        elif start_idx is not None and line.strip() == '}':
            end_idx = i
            break
    if start_idx is None or end_idx is None:
        raise ValueError("Could not find the GLOBAL_PARAMETERS block to update.")
    del lines[start_idx:end_idx + 1]
    new_global_parameters_block = ['GLOBAL_PARAMETERS = {\n']
    for param, range_values in GLOBAL_PARAMETERS.items():
        new_global_parameters_block.append(f"    '{param}': {range_values},\n")
    new_global_parameters_block.append("}\n")
    lines[start_idx:start_idx] = new_global_parameters_block
    with open(current_file, 'w', encoding='utf-8') as file:
        for line in lines:
            file.write(line.rstrip() + '\n')


def save_machines_config():
    """Save the current machine configuration to the file, ensuring no duplication/misplacement."""
    current_file = inspect.getfile(inspect.currentframe())
    with open(current_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    start_idx = None
    end_idx = None
    brace_balance = 0
    for i, line in enumerate(lines):
        if line.strip().startswith('MACHINE_TYPES = {'):
            start_idx = i
            brace_balance = 1
        elif start_idx is not None:
            brace_balance += line.count('{')
            brace_balance -= line.count('}')
            if brace_balance == 0:
                end_idx = i
                break

    if start_idx is None or end_idx is None:
        raise ValueError("Could not find the MACHINE_TYPES block to update.")
    del lines[start_idx:end_idx + 1]
    new_machine_types_block = ['MACHINE_TYPES = {\n']
    for machine, info in MACHINE_TYPES.items():
        new_machine_types_block.append(f"    '{machine}': {{\n")
        new_machine_types_block.append(f"        'id': {info['id']},\n")
        new_machine_types_block.append("        'parameters': [\n")
        for param in info['parameters']:
            new_machine_types_block.append(
                f"            {{'parameter': '{param['parameter']}', "
                f"'topic': '{param['topic']}', 'unit': '{param['unit']}'}},\n"
            )
        new_machine_types_block.append("        ],\n")
        new_machine_types_block.append("    },\n")
    new_machine_types_block.append("}\n")
    lines[start_idx:start_idx] = new_machine_types_block
    with open(current_file, 'w', encoding='utf-8') as file:
        file.writelines(lines)


def save_parameter_ranges():
    """Save the current parameter ranges to the script without duplicating."""
    regenerate_parameter_ranges()
    current_file = inspect.getfile(inspect.currentframe())
    with open(current_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    with open(current_file, 'w', encoding='utf-8') as file:
        inside_parameter_ranges = False
        parameter_ranges_written = False
        for line in lines:
            if line.strip().startswith('PARAMETER_RANGES = {') and not parameter_ranges_written:
                file.write('PARAMETER_RANGES = {\n')
                for machine, ranges in PARAMETER_RANGES.items():
                    file.write(f"    '{machine}': {{\n")
                    for param, range_values in ranges.items():
                        file.write(f"        '{param}': {range_values},\n")
                    file.write("    },\n")
                file.write("}\n")
                parameter_ranges_written = True
                inside_parameter_ranges = True
            elif inside_parameter_ranges and line.strip() == '}':
                inside_parameter_ranges = False
            elif not inside_parameter_ranges:
                file.write(line)
